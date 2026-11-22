import { z } from "zod";
import User from "../../../../models/User";
import { begin, handleError, json } from "../../../../lib/auth/api";
import { checkOtp } from "../../../../lib/auth/otp";
import { clearPreAuth, readPreAuth, startSession } from "../../../../lib/auth/session";

const schema = z.object({ code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code") });

export async function POST(request) {
  try {
    const { data, response } = await begin(request, schema);
    if (response) return response;

    const userId = await readPreAuth();
    if (!userId) return json({ error: "Your sign-in timed out. Please sign in again.", code: "restart" }, 401);

    const user = await User.findById(userId);
    if (!user || user.status !== "active" || user.approvalStatus !== "approved") {
      return json({ error: "Please sign in again.", code: "restart" }, 401);
    }

    const result = await checkOtp(user, "login", data.code);
    if (result === "wrong") return json({ error: "That code is not right." }, 400);
    if (result === "locked") return json({ error: "Too many wrong codes. Please sign in again.", code: "restart" }, 429);
    if (result === "expired") return json({ error: "That code has expired. Please sign in again.", code: "restart" }, 400);

    user.contactVerified = true;
    user.lastLoginAt = new Date();
    await user.save();
    await clearPreAuth();
    await startSession(user);
    return json({ ok: true, next: user.mustChangePassword ? "/admin/profile?forced=1" : "/admin" });
  } catch (err) {
    return handleError(err);
  }
}
