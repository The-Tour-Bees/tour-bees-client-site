import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectDb, hasDatabase } from "../db";
import User from "../../models/User";

export class AuthNotConfigured extends Error {}

const SESSION_COOKIE = "tb_session";
const PRE_COOKIE = "tb_pre"; // password accepted, one-time code still needed
const SESSION_DAYS = 7;

export const authConfigured = () => hasDatabase() && (process.env.AUTH_SECRET?.length ?? 0) >= 32;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new AuthNotConfigured("AUTH_SECRET must be set to at least 32 characters");
  return new TextEncoder().encode(s);
}

const sign = (payload, ttl) =>
  new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(ttl).sign(secret());

async function verify(token, purpose) {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.purpose === purpose ? payload : null;
  } catch (err) {
    if (err instanceof AuthNotConfigured) throw err;
    return null;
  }
}

const options = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge,
});

export async function startSession(user) {
  const token = await sign({ sub: String(user._id), purpose: "session" }, `${SESSION_DAYS}d`);
  (await cookies()).set(SESSION_COOKIE, token, options(SESSION_DAYS * 24 * 3600));
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function startPreAuth(user) {
  const token = await sign({ sub: String(user._id), purpose: "otp" }, "10m");
  (await cookies()).set(PRE_COOKIE, token, options(10 * 60));
}

export async function readPreAuth() {
  const token = (await cookies()).get(PRE_COOKIE)?.value;
  return token ? (await verify(token, "otp"))?.sub ?? null : null;
}

export async function clearPreAuth() {
  (await cookies()).delete(PRE_COOKIE);
}

// The signed-in user, loaded fresh so deactivating or rejecting an account takes effect at once.
export async function getCurrentUser() {
  if (!authConfigured()) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verify(token, "session");
  if (!payload?.sub) return null;

  await connectDb();
  const user = await User.findById(payload.sub);
  if (!user || user.status !== "active" || user.approvalStatus !== "approved") return null;
  return user;
}
