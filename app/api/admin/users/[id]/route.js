import mongoose from "mongoose";
import { z } from "zod";
import User from "../../../../../models/User";
import { begin, handleError, json } from "../../../../../lib/auth/api";
import { apiUser } from "../../../../../lib/auth/guard";

const schema = z.object({ action: z.enum(["approve", "reject", "activate", "deactivate"]) });

export async function PATCH(request, { params }) {
  try {
    const { data, response } = await begin(request, schema);
    if (response) return response;

    const { user: admin, error } = await apiUser(["admin"]);
    if (error) return error;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return json({ error: "User not found." }, 404);

    const user = await User.findById(id);
    if (!user) return json({ error: "User not found." }, 404);
    if (String(user._id) === String(admin._id) && data.action !== "activate") {
      return json({ error: "You cannot change your own account here." }, 400);
    }

    if (data.action === "approve") {
      user.approvalStatus = "approved";
      user.status = "active";
    } else if (data.action === "reject") {
      user.approvalStatus = "rejected";
      user.status = "inactive";
    } else if (data.action === "activate") {
      if (user.approvalStatus !== "approved") return json({ error: "Approve this account first." }, 400);
      user.status = "active";
    } else {
      user.status = "inactive";
    }
    await user.save();
    return json({ ok: true, approvalStatus: user.approvalStatus, status: user.status });
  } catch (err) {
    return handleError(err);
  }
}
