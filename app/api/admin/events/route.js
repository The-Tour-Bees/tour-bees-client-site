import User from "../../../../models/User";
import Event from "../../../../models/Event";
import { begin, handleError, json } from "../../../../lib/auth/api";
import { apiUser } from "../../../../lib/auth/guard";
import { eventSchema } from "../../../../lib/event-input";

export async function POST(request) {
  try {
    const { data, response } = await begin(request, eventSchema);
    if (response) return response;
    const { error } = await apiUser(["admin"]);
    if (error) return error;

    if (data.hostId) {
      const host = await User.findOne({ _id: data.hostId, accountType: "host" });
      if (!host) return json({ error: "Please check the highlighted fields.", fieldErrors: { hostId: "Choose a host" } }, 400);
    }

    try {
      const event = await Event.create({
        ...data,
        hostId: data.hostId || null,
        endsOn: data.endsOn || data.startsOn,
        place: data.place || data.location,
        seatsLeft: data.seats,
      });
      return json({ id: String(event._id) }, 201);
    } catch (err) {
      if (err?.code === 11000) return json({ error: "Please check the highlighted fields.", fieldErrors: { slug: "That address is already used" } }, 409);
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}
