import crypto from "node:crypto";
import Booking from "../models/Booking";
import Commission from "../models/Commission";
import Event from "../models/Event";
import { eventStatus } from "./events";

export class BookingError extends Error {
  constructor(message, status = 400, fieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeRef = () => `TB-${Array.from({ length: 6 }, () => REF_ALPHABET[crypto.randomInt(REF_ALPHABET.length)]).join("")}`;

// Which bookings a signed-in user may see.
export function bookingScope(user) {
  switch (user.accountType) {
    case "admin": return {};
    case "host": return { hostId: user._id };
    case "agent": return { agentId: user._id };
    default: return { $or: [{ "guest.mobile": user.mobile }, { "guest.email": user.email }] };
  }
}

// Creates a booking made on behalf of a guest by a host, agent or admin.
export async function createBooking(user, input) {
  const { productType, eventId, title, guestName, guestMobile, guestEmail, travellers, amountBdt, notes } = input;
  let event = null;
  let productTitle = title;

  if (productType === "event") {
    event = await Event.findById(eventId);
    if (!event || !event.published) throw new BookingError("Choose an event.", 400, { eventId: "Choose an event" });
    if (user.accountType === "host" && String(event.hostId) !== String(user._id)) {
      throw new BookingError("You can only book your own events.", 403);
    }
    if (eventStatus({ startsOn: event.startsOn, endsOn: event.endsOn }) === "previous") {
      throw new BookingError("This event has finished.", 400, { eventId: "This event has finished" });
    }
    productTitle = event.title;
  } else if (user.accountType === "host") {
    throw new BookingError("Hosts can book their own events only.", 403);
  }

  // Take the seats first, atomically, so two people cannot book the last seats together.
  let seatsTaken = 0;
  if (event && event.seatsLeft != null) {
    const taken = await Event.updateOne({ _id: event._id, seatsLeft: { $gte: travellers } }, { $inc: { seatsLeft: -travellers } });
    if (taken.modifiedCount !== 1) {
      throw new BookingError("Not enough seats left.", 409, { travellers: `Only ${event.seatsLeft} seats left` });
    }
    seatsTaken = travellers;
  }

  try {
    const booking = await Booking.create({
      ref: makeRef(),
      product: { type: productType, eventId: event?._id ?? null, title: productTitle },
      guest: { name: guestName, mobile: guestMobile, email: guestEmail },
      travellers,
      amountBdt,
      notes,
      createdBy: user._id,
      createdByRole: user.accountType,
      hostId: event?.hostId ?? null,
      agentId: user.accountType === "agent" ? user._id : null,
    });

    const percent = user.agent?.commissionPercent;
    if (user.accountType === "agent" && percent != null) {
      await Commission.create({ agentId: user._id, bookingId: booking._id, percent, amountBdt: Math.round((amountBdt * percent) / 100) });
    }
    return booking;
  } catch (err) {
    if (seatsTaken) await Event.updateOne({ _id: event._id }, { $inc: { seatsLeft: seatsTaken } });
    throw err;
  }
}

// Admin changes a booking's status. Cancelling gives the seats back and cancels the commission.
export async function setBookingStatus(booking, status) {
  if (booking.status === "cancelled") throw new BookingError("A cancelled booking cannot be changed.");
  if (status === "cancelled") {
    if (booking.product.eventId) {
      await Event.updateOne({ _id: booking.product.eventId, seatsLeft: { $ne: null } }, { $inc: { seatsLeft: booking.travellers } });
    }
    await Commission.updateOne({ bookingId: booking._id, status: "due" }, { status: "cancelled" });
  }
  booking.status = status;
  await booking.save();
  return booking;
}
