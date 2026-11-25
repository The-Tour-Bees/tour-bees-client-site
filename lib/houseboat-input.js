import { z } from "zod";

const text = (max) => z.string().trim().max(max);
const lines = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const optionalInt = (min, max) => z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().min(min).max(max).optional());
const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes").max(80);
const tags = text(500).default("").transform((s) => s.split(",").map((t) => t.trim()).filter(Boolean));
const list = (max) => text(max).default("").transform(lines);
const sortOrder = z.preprocess((v) => (v === "" || v == null ? 0 : v), z.coerce.number().int().min(-100000).max(100000));

export const houseboatSchema = z.object({
  slug,
  name: text(160).min(2, "Enter a name"),
  place: text(160).min(2, "Enter the place"),
  summary: text(300).default(""),
  description: text(5000).default(""),
  cabins: optionalInt(1, 1000),
  capacity: optionalInt(1, 10000),
  dayTrip: z.boolean().default(false),
  basePriceBdt: z.coerce.number().min(0, "Enter the price").max(100_000_000),
  amenities: list(3000),
  images: list(4000),
  tags,
  published: z.boolean().default(true),
  sortOrder,
});
