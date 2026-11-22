import mongoose from "mongoose";
import User from "../../../../../models/User";
import Event from "../../../../../models/Event";
import { begin, handleError, json } from "../../../../../lib/auth/api";
import { apiUser } from "../../../../../lib/auth/guard";
import { eventSchema } from "../../../../../lib/event-input";

export async function PATCH(request, { params }) {
  try {
    const { data, response } = await begin(request, eventSchema);
    if (response) return response;
    const { error } = await apiUser(["admin"]);
    if (error) return error;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return json({ error: "Event not found." }, 404);
    const event = await Event.findById(id);
    if (!event) return json({ error: "Event not found." }, 404);

    if (data.hostId) {
      const host = await User.findOne({ _id: data.hostId, accountType: "host" });
      if (!host) return json({ error: "Please check the highlighted fields.", fieldErrors: { hostId: "Choose a host" } }, 400);
    }

    // Keep the number of seats already taken when the total changes.
    if (data.seats == null) {
      event.seats = undefined;
      event.seatsLeft = undefined;
    } else {
      const taken = event.seats != null && event.seatsLeft != null ? event.seats - event.seatsLeft : 0;
      event.seats = data.seats;
      event.seatsLeft = Math.max(0, data.seats - taken);
    }

    Object.assign(event, {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      description: data.description,
      location: data.location,
      place: data.place || data.location,
      startsOn: data.startsOn,
      endsOn: data.endsOn || data.startsOn,
      hostId: data.hostId || null,
      basePriceBdt: data.basePriceBdt,
      images: data.images,
      tags: data.tags,
      inclusions: data.inclusions,
      itinerary: data.itinerary,
      published: data.published,
    });

    try {
      await event.save();
    } catch (err) {
      if (err?.code === 11000) return json({ error: "Please check the highlighted fields.", fieldErrors: { slug: "That address is already used" } }, 409);
      throw err;
    }
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
