import mongoose from "mongoose";
import { z } from "zod";

const text = (max) => z.string().trim().max(max);
const lines = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");
const optionalInt = z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().min(0).max(100000).optional());

// What the admin event form sends. Multi-line boxes arrive as one string each.
export const eventSchema = z
  .object({
    title: text(160).min(2, "Enter a title"),
    slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes").max(80),
    summary: text(300).default(""),
    description: text(5000).default(""),
    location: text(160).min(2, "Enter the location"),
    place: text(80).default(""),
    startsOn: date,
    endsOn: z.union([z.literal(""), date]).default(""),
    hostId: z.union([z.literal(""), z.string().refine((v) => mongoose.isValidObjectId(v), "Choose a host")]).default(""),
    basePriceBdt: z.coerce.number().min(0, "Enter the price").max(100_000_000),
    seats: optionalInt,
    images: text(4000).default("").transform(lines),
    tags: text(500).default("").transform((s) => s.split(",").map((t) => t.trim()).filter(Boolean)),
    inclusions: text(3000).default("").transform(lines),
    itinerary: text(6000).default("").transform((s) => lines(s).map((l) => {
      const [title, ...rest] = l.split("|");
      return { title: title.trim(), text: rest.join("|").trim() };
    })),
    published: z.boolean().default(true),
  })
  .refine((d) => !d.endsOn || d.endsOn >= d.startsOn, { path: ["endsOn"], message: "End date must be after the start date" });
