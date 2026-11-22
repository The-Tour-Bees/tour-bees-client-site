import { handleError, json } from "../../../../lib/auth/api";
import { getCurrentUser } from "../../../../lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return json({ user: null }, 401);
    return json({
      user: { id: String(user._id), fullName: user.fullName, accountType: user.accountType, mustChangePassword: user.mustChangePassword },
    });
  } catch (err) {
    return handleError(err);
  }
}
