import { z } from "zod";
import User from "../../../../models/User";
import { begin, handleError, json } from "../../../../lib/auth/api";
import { apiUser } from "../../../../lib/auth/guard";
import { hashPassword, MIN_PASSWORD, verifyPassword } from "../../../../lib/auth/password";

const schema = z.object({
  currentPassword: z.string().min(1, "Enter your current password").max(200),
  newPassword: z.string().min(MIN_PASSWORD, `Use at least ${MIN_PASSWORD} characters`).max(200),
});

export async function POST(request) {
  try {
    const { data, response } = await begin(request, schema);
    if (response) return response;

    const { user: current, error } = await apiUser();
    if (error) return error;

    const user = await User.findById(current._id).select("+passwordHash");
    if (!(await verifyPassword(data.currentPassword, user.passwordHash))) {
      return json({ error: "Please check the highlighted fields.", fieldErrors: { currentPassword: "That is not your current password" } }, 400);
    }
    if (data.currentPassword === data.newPassword) {
      return json({ error: "Please check the highlighted fields.", fieldErrors: { newPassword: "Choose a different password" } }, 400);
    }

    user.passwordHash = await hashPassword(data.newPassword);
    user.mustChangePassword = false;
    await user.save();
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
