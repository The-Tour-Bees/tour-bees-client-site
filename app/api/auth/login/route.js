import { z } from "zod";
import { begin, findByIdentifier, handleError, json } from "../../../../lib/auth/api";
import { deliver, NotifyUnavailable } from "../../../../lib/notify";
import { issueOtp } from "../../../../lib/auth/otp";
import { burnPasswordCheck, maskMobile, verifyPassword } from "../../../../lib/auth/password";
import { startPreAuth, startSession } from "../../../../lib/auth/session";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

const schema = z.object({
  identifier: z.string().trim().min(3, "Enter your mobile or email").max(200),
  password: z.string().min(1, "Enter your password").max(200),
});

const WRONG = "Wrong mobile, email or password.";

export async function POST(request) {
  try {
    const { data, response } = await begin(request, schema);
    if (response) return response;

    const user = await findByIdentifier(data.identifier, { withPassword: true });
    if (!user) {
      await burnPasswordCheck(data.password);
      return json({ error: WRONG }, 401);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return json({ error: "Too many wrong attempts. Please try again in a few minutes." }, 429);
    }

    if (!(await verifyPassword(data.password, user.passwordHash))) {
      user.failedLogins += 1;
      if (user.failedLogins >= MAX_FAILS) {
        user.lockedUntil = new Date(Date.now() + LOCK_MS);
        user.failedLogins = 0;
      }
      await user.save();
      return json({ error: WRONG }, 401);
    }

    // Password is right: say why the account cannot sign in yet.
    if (user.approvalStatus === "pending") return json({ error: "Your account is waiting for approval.", code: "pending" }, 403);
    if (user.approvalStatus === "rejected") return json({ error: "Your account was not approved. Please contact us.", code: "rejected" }, 403);
    if (user.status !== "active") return json({ error: "Your account is inactive. Please contact us.", code: "inactive" }, 403);

    user.failedLogins = 0;
    user.lockedUntil = null;

    const needsCode = !user.contactVerified || process.env.OTP_EVERY_LOGIN === "true";
    if (needsCode) {
      await user.save();
      const code = await issueOtp(user, "login");
      if (code) {
        try {
          await deliver({ channel: "sms", to: user.mobile, message: `Your Tour Bees code is ${code}. It expires in 5 minutes.` });
        } catch (err) {
          if (err instanceof NotifyUnavailable) return json({ error: "We could not send your code right now. Please try again later." }, 503);
          throw err;
        }
      }
      await startPreAuth(user);
      return json({ step: "otp", sentTo: maskMobile(user.mobile) });
    }

    user.lastLoginAt = new Date();
    await user.save();
    await startSession(user);
    return json({ ok: true, next: user.mustChangePassword ? "/admin/profile?forced=1" : "/admin" });
  } catch (err) {
    return handleError(err);
  }
}
