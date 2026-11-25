import Hotel from "../../../../models/Hotel";
import { begin, handleError, json } from "../../../../lib/auth/api";
import { apiUser } from "../../../../lib/auth/guard";
import { hotelSchema } from "../../../../lib/hotel-input";

export async function POST(request) {
  try {
    const { data, response } = await begin(request, hotelSchema);
    if (response) return response;
    const { error } = await apiUser(["admin"]);
    if (error) return error;

    try {
      const doc = await Hotel.create(data);
      return json({ id: String(doc._id) }, 201);
    } catch (err) {
      if (err?.code === 11000) return json({ error: "Please check the highlighted fields.", fieldErrors: { slug: "That address is already used" } }, 409);
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}
