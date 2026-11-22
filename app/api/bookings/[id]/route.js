import mongoose from "mongoose";
import { z } from "zod";
import Booking from "../../../../models/Booking";
import { begin, handleError, json } from "../../../../lib/auth/api";
import { apiUser } from "../../../../lib/auth/guard";
import { BookingError, setBookingStatus } from "../../../../lib/bookings";

const schema = z.object({ status: z.enum(["pending", "confirmed", "completed", "cancelled"]) });

export async function PATCH(request, { params }) {
  try {
    const { data, response } = await begin(request, schema);
    if (response) return response;
    const { error } = await apiUser(["admin"]);
    if (error) return error;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return json({ error: "Booking not found." }, 404);
    const booking = await Booking.findById(id);
    if (!booking) return json({ error: "Booking not found." }, 404);

    await setBookingStatus(booking, data.status);
    return json({ ok: true, status: booking.status });
  } catch (err) {
    if (err instanceof BookingError) return json({ error: err.message }, err.status);
    return handleError(err);
  }
}
