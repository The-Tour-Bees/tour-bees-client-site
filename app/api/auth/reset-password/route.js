import { z } from "zod";
import { begin, findByIdentifier, handleError, json } from "../../../../lib/auth/api";
import { checkOtp } from "../../../../lib/auth/otp";
import { hashPassword, MIN_PASSWORD } from "../../../../lib/auth/password";
import { rateLimit } from "../../../../lib/rate-limit";

const schema = z.object({
  identifier: z.string().trim().min(3, "Enter your mobile or email").max(200),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
  newPassword: z.string().min(MIN_PASSWORD, `Use at least ${MIN_PASSWORD} characters`).max(200),
});

export async function POST(request) {
  const limited = rateLimit(request, "auth/reset-password");
  if (limited) return limited;

  try {
    const { data, response } = await begin(request, schema);
    if (response) return response;

    const user = await findByIdentifier(data.identifier);
    const bad = json({ error: "That code is not right or has expired." }, 400);
    if (!user || user.status !== "active" || user.approvalStatus !== "approved") return bad;

    const result = await checkOtp(user, "reset", data.code);
    if (result !== "ok") return bad;

    user.passwordHash = await hashPassword(data.newPassword);
    user.mustChangePassword = false;
    user.contactVerified = true;
    user.failedLogins = 0;
    user.lockedUntil = null;
    await user.save();
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
