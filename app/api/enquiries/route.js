import { NextResponse } from "next/server";
import { z } from "zod";
import { todayInDhaka } from "../../../lib/dates";
import { EnquiryStorageUnavailable, saveEnquiry } from "../../../lib/enquiries";

const text = (max) => z.string().trim().max(max);

const person = {
  name: text(120).min(2, "Please enter your name"),
  mobile: text(30).regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid mobile number"),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]).default(""),
};

const INTERESTS = ["Events", "Trips", "Hotels, resorts and houseboats", "Something else"];
const SUBJECTS = ["General question", "Event", "Customized trip", "Hotel / resort", "Houseboat", "Other"];

const date = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")]).default("");
const optionalNumber = z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().int().min(0).max(1_000_000_000).optional());

const requiredDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");
const optionalCount = (max) =>
  z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().int().min(0).max(max).optional());

const HOTEL_LEVELS = ["No preference", "Budget", "Standard", "Comfort", "Luxury"];
const TRANSPORT = ["Not sure yet", "Please include transport", "I will arrange my own"];
const CURRENCIES = ["BDT", "USD", "EUR", "INR"];

const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("contact"),
    ...person,
    subject: z.enum(SUBJECTS).default("General question"),
    message: text(2000).min(5, "Please write a short message"),
  }),
  z.object({
    type: z.literal("event"),
    ...person,
    eventSlug: text(120).min(1),
    eventTitle: text(200).default(""),
    guests: z.coerce.number().int().min(1, "At least 1 guest").max(50, "Please call us for large groups").default(1),
    message: text(2000).default(""),
  }),
  z
    .object({
      type: z.literal("custom_trip"),
      ...person,
      scope: z.enum(["Domestic", "International"]).default("Domestic"),
      destination: text(160).min(2, "Tell us where you want to go"),
      startDate: date,
      endDate: date,
      travellers: z.coerce.number().int().min(1, "At least 1 traveller").max(50, "Please call us for large groups").default(1),
      budget: optionalNumber,
      budgetCurrency: z.enum(CURRENCIES).default("BDT"),
      hotelLevel: z.enum(HOTEL_LEVELS).default("No preference"),
      transport: z.enum(TRANSPORT).default("Not sure yet"),
      interests: text(300).default(""),
      message: text(2000).default(""),
      tripSlug: text(120).default(""),
      tripTitle: text(200).default(""),
    })
    .refine((d) => !d.startDate || d.startDate >= todayInDhaka(), { path: ["startDate"], message: "Start date cannot be in the past" })
    .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, { path: ["endDate"], message: "End date must be after the start date" }),
  z
    .object({
      type: z.literal("hotel"),
      ...person,
      hotelSlug: text(120).default(""),
      hotelName: text(200).default(""),
      place: text(160).default(""),
      checkIn: requiredDate,
      checkOut: requiredDate,
      adults: z.coerce.number().int().min(1, "At least 1 adult").max(20, "Please call us for large groups").default(1),
      children: optionalCount(20),
      rooms: z.coerce.number().int().min(1, "At least 1 room").max(10, "Please call us for more than 10 rooms").default(1),
      message: text(2000).default(""),
    })
    .refine((d) => d.hotelSlug || d.place, { path: ["place"], message: "Tell us where you want to stay" })
    .refine((d) => d.checkIn >= todayInDhaka(), { path: ["checkIn"], message: "Check-in cannot be in the past" })
    .refine((d) => d.checkOut > d.checkIn, { path: ["checkOut"], message: "Check-out must be after check-in" }),
  z
    .object({
      type: z.literal("houseboat"),
      ...person,
      houseboatSlug: text(120).default(""),
      houseboatName: text(200).default(""),
      place: text(160).default(""),
      stayType: z.enum(["Overnight", "Day trip"]).default("Overnight"),
      checkIn: requiredDate,
      checkOut: date,
      guests: z.coerce.number().int().min(1, "At least 1 guest").max(100, "Please call us for large groups").default(1),
      cabins: optionalCount(20),
      message: text(2000).default(""),
    })
    .refine((d) => d.houseboatSlug || d.place, { path: ["place"], message: "Tell us where you want to go" })
    .refine((d) => d.checkIn >= todayInDhaka(), { path: ["checkIn"], message: "Date cannot be in the past" })
    .refine((d) => d.stayType === "Day trip" || d.checkOut > d.checkIn, { path: ["checkOut"], message: "Check-out must be after check-in" }),
  z.object({
    type: z.literal("vip"),
    ...person,
    message: text(2000).default(""),
  }),
  z.object({
    type: z.literal("investor"),
    ...person,
    company: text(160).default(""),
    interest: z.enum(INTERESTS).default("Something else"),
    message: text(2000).default(""),
  }),
]);

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never fill this hidden field. Pretend success for bots.
  if (typeof body?.website === "string" && body.website !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, v[0]]),
    );
    return NextResponse.json(
      { error: "Please check the highlighted fields.", fieldErrors },
      { status: 400 },
    );
  }

  try {
    await saveEnquiry(parsed.data);
  } catch (err) {
    if (err instanceof EnquiryStorageUnavailable) {
      return NextResponse.json(
        { error: "Online enquiries are not available yet. Please contact us directly." },
        { status: 503 },
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
