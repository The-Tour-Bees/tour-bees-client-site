import crypto from "node:crypto";
import Otp from "../../models/Otp";

const TTL_MS = 5 * 60 * 1000;
const RESEND_AFTER_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

const hashCode = (code) => crypto.createHmac("sha256", process.env.AUTH_SECRET).update(code).digest("hex");

// Returns the plain code to deliver, or null when a code was sent too recently.
export async function issueOtp(user, purpose) {
  const last = await Otp.findOne({ userId: user._id, purpose }).sort({ createdAt: -1 });
  if (last && Date.now() - last.createdAt.getTime() < RESEND_AFTER_MS) return null;

  await Otp.deleteMany({ userId: user._id, purpose });
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  await Otp.create({ userId: user._id, purpose, codeHash: hashCode(code), expiresAt: new Date(Date.now() + TTL_MS) });
  return code;
}

// "ok" | "wrong" | "expired" | "locked"
export async function checkOtp(user, purpose, code) {
  const otp = await Otp.findOne({ userId: user._id, purpose, usedAt: null }).sort({ createdAt: -1 });
  if (!otp || otp.expiresAt < new Date()) return "expired";
  if (otp.attempts >= MAX_ATTEMPTS) return "locked";

  const given = Buffer.from(hashCode(String(code)));
  const stored = Buffer.from(otp.codeHash);
  if (given.length !== stored.length || !crypto.timingSafeEqual(given, stored)) {
    otp.attempts += 1;
    await otp.save();
    return "wrong";
  }

  otp.usedAt = new Date();
  await otp.save();
  return "ok";
}
