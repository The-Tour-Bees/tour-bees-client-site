import { z } from "zod";
import { begin, findByIdentifier, handleError, json } from "../../../../lib/auth/api";
import { issueOtp } from "../../../../lib/auth/otp";
import { deliver } from "../../../../lib/notify";
import { rateLimit } from "../../../../lib/rate-limit";

const schema = z.object({ identifier: z.string().trim().min(3, "Enter your mobile or email").max(200) });

// Always answers the same way, so nobody can use this to find out who has an account.
export async function POST(request) {
  const limited = rateLimit(request, "auth/forgot-password");
  if (limited) return limited;

  try {
    const { data, response } = await begin(request, schema);
    if (response) return response;

    const user = await findByIdentifier(data.identifier);
    if (user && user.status === "active" && user.approvalStatus === "approved") {
      const code = await issueOtp(user, "reset");
      if (code) {
        await deliver({ channel: "sms", to: user.mobile, message: `Your Tour Bees password reset code is ${code}. It expires in 5 minutes.` }).catch((err) =>
          console.error("Could not send reset code:", err.message),
        );
      }
    }
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
