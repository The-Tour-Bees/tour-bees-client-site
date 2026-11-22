import Booking from "../models/Booking";
import Commission from "../models/Commission";
import { bookingScope } from "./bookings";

// Plain objects for the admin pages, so they can be passed to client components.
export async function loadBookings(user, { limit = 200 } = {}) {
  const docs = await Booking.find(bookingScope(user)).sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map((b) => ({
    id: String(b._id),
    ref: b.ref,
    title: b.product.title,
    guestName: b.guest.name,
    travellers: b.travellers,
    amountBdt: b.amountBdt,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }));
}

export async function commissionAmounts(agentId, bookingIds) {
  const rows = await Commission.find({ agentId, bookingId: { $in: bookingIds } }).lean();
  return Object.fromEntries(rows.filter((r) => r.status !== "cancelled").map((r) => [String(r.bookingId), r.amountBdt]));
}

export const sum = (rows, key) => rows.reduce((total, r) => total + (r[key] ?? 0), 0);
