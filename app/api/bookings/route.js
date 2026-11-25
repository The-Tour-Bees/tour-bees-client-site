import { after } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { begin, handleError, json } from "../../../lib/auth/api";
import { apiUser } from "../../../lib/auth/guard";
import { normalizeMobile } from "../../../lib/auth/password";
import { BookingError, createBooking } from "../../../lib/bookings";
import { notifyTeam } from "../../../lib/notify";
import { clientIp, rateLimit } from "../../../lib/rate-limit";
import { TURNSTILE_FAILED, TURNSTILE_FIELD, verifyTurnstile } from "../../../lib/turnstile";

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
    [TURNSTILE_FIELD]: z.string().default(""),
  })
  .refine((d) => d.productType !== "event" || mongoose.isValidObjectId(d.eventId), { path: ["eventId"], message: "Choose an event" })
  .refine((d) => d.productType !== "other" || d.title.length >= 2, { path: ["title"], message: "Say what the booking is for" });

export async function POST(request) {
  try {
    const { user, error } = await apiUser(["host", "agent", "admin"]);
    // Signed-in staff are never throttled; only callers without a session are.
    if (error) return (error.status === 401 && rateLimit(request, "bookings")) || error;
    const { data, response } = await begin(request, schema);
    if (response) return response;

    if (!(await verifyTurnstile(data[TURNSTILE_FIELD], clientIp(request)))) {
      return json({ error: TURNSTILE_FAILED }, 400);
    }

    const booking = await createBooking(user, data);
    const { guest, product, createdAt } = booking;
    after(() =>
      notifyTeam({
        type: "booking",
        id: String(booking._id),
        name: guest.name,
        contact: { mobile: guest.mobile, email: guest.email },
        item: product.title,
        date: createdAt,
      }),
    );
    return json({ id: String(booking._id), ref: booking.ref }, 201);
  } catch (err) {
    if (err instanceof BookingError) {
      return json({ error: err.fieldErrors ? "Please check the highlighted fields." : err.message, fieldErrors: err.fieldErrors }, err.status);
    }
    return handleError(err);
  }
}
