import mongoose from "mongoose";
import { z } from "zod";
import Enquiry from "../../../../../models/Enquiry";
import { begin, handleError, json } from "../../../../../lib/auth/api";
import { apiUser } from "../../../../../lib/auth/guard";

const schema = z.object({
  status: z.enum(["new", "contacted", "confirmed", "closed", "cancelled"]).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function PATCH(request, { params }) {
  try {
    const { data, response } = await begin(request, schema);
    if (response) return response;
    const { user, error } = await apiUser(["admin"]);
    if (error) return error;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return json({ error: "Enquiry not found." }, 404);
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) return json({ error: "Enquiry not found." }, 404);

    if (data.status) {
      enquiry.status = data.status;
      if (data.status !== "new" && !enquiry.assignedTo) enquiry.assignedTo = user._id;
    }
    if (data.notes != null) enquiry.notes = data.notes;
    await enquiry.save();
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
