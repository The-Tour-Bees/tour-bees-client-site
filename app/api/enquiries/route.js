import { NextResponse } from "next/server";
import { z } from "zod";
import { EnquiryStorageUnavailable, saveEnquiry } from "../../../lib/enquiries";

const text = (max) => z.string().trim().max(max);

const person = {
  name: text(120).min(2, "Please enter your name"),
  mobile: text(30).regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid mobile number"),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]).default(""),
};

const INTERESTS = ["Events", "Trips", "Hotels, resorts and houseboats", "Something else"];
const SUBJECTS = ["General question", "Event", "Customized trip", "Hotel / resort", "Houseboat", "Other"];

const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("contact"),
    ...person,
    subject: z.enum(SUBJECTS).default("General question"),
    message: text(2000).min(5, "Please write a short message"),
  }),
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
