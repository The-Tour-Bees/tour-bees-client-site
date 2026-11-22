import { z } from "zod";
import mongoose from "mongoose";
import { begin, handleError, json } from "../../../lib/auth/api";
import { apiUser } from "../../../lib/auth/guard";
import { normalizeMobile } from "../../../lib/auth/password";
import { BookingError, createBooking } from "../../../lib/bookings";

const text = (max) => z.string().trim().max(max);

const schema = z
  .object({
    productType: z.enum(["event", "other"]),
    eventId: z.string().default(""),
    title: text(200).default(""),
    guestName: text(120).min(2, "Enter the guest's name"),
    guestMobile: z.string().transform(normalizeMobile).pipe(z.string().regex(/^\+?[0-9]{7,15}$/, "Enter a valid mobile number")),
    guestEmail: z.union([z.literal(""), z.email("Enter a valid email address")]).default("").transform((v) => v.toLowerCase()),
    travellers: z.coerce.number().int().min(1, "At least 1 traveller").max(100, "Please split large groups"),
    amountBdt: z.coerce.number().min(0, "Enter the amount").max(100_000_000),
    notes: text(1000).default(""),
  })
  .refine((d) => d.productType !== "event" || mongoose.isValidObjectId(d.eventId), { path: ["eventId"], message: "Choose an event" })
  .refine((d) => d.productType !== "other" || d.title.length >= 2, { path: ["title"], message: "Say what the booking is for" });

export async function POST(request) {
  try {
    const { data, response } = await begin(request, schema);
    if (response) return response;
    const { user, error } = await apiUser(["host", "agent", "admin"]);
    if (error) return error;

    const booking = await createBooking(user, data);
    return json({ id: String(booking._id), ref: booking.ref }, 201);
  } catch (err) {
    if (err instanceof BookingError) {
      return json({ error: err.fieldErrors ? "Please check the highlighted fields." : err.message, fieldErrors: err.fieldErrors }, err.status);
    }
    return handleError(err);
  }
}
