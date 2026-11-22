import mongoose from "mongoose";
import { z } from "zod";
import Commission from "../../../../models/Commission";
import { begin, handleError, json } from "../../../../lib/auth/api";
import { apiUser } from "../../../../lib/auth/guard";

const schema = z.object({ action: z.literal("markPaid") });

export async function PATCH(request, { params }) {
  try {
    const { response } = await begin(request, schema);
    if (response) return response;
    const { error } = await apiUser(["admin"]);
    if (error) return error;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return json({ error: "Commission not found." }, 404);
    const result = await Commission.updateOne({ _id: id, status: "due" }, { status: "paid", paidAt: new Date() });
    if (result.modifiedCount !== 1) return json({ error: "Only a commission that is due can be marked paid." }, 400);
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
