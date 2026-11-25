import { z } from "zod";

const text = (max) => z.string().trim().max(max);
const lines = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const optionalInt = (min, max) => z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().min(min).max(max).optional());
const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes").max(80);
const tags = text(500).default("").transform((s) => s.split(",").map((t) => t.trim()).filter(Boolean));
const list = (max) => text(max).default("").transform(lines);
const sortOrder = z.preprocess((v) => (v === "" || v == null ? 0 : v), z.coerce.number().int().min(-100000).max(100000));

// What the admin trip form sends. Multi-line boxes arrive as one string each.
export const tripSchema = z.object({
  slug,
  scope: z.enum(["domestic", "international"], { message: "Choose domestic or international" }),
  title: text(160).min(2, "Enter a title"),
  summary: text(300).default(""),
  description: text(5000).default(""),
  destination: text(160).min(2, "Enter the destination"),
  durationDays: z.coerce.number().int("Enter whole days").min(1, "Enter the number of days").max(365),
  basePriceBdt: z.coerce.number().min(0, "Enter the price").max(100_000_000),
  images: list(4000),
  tags,
  inclusions: list(3000),
  exclusions: list(3000),
  itinerary: text(6000).default("").transform((s) => lines(s).map((l) => {
    const [title, ...rest] = l.split("|");
    return { title: title.trim(), text: rest.join("|").trim() };
  })),
  published: z.boolean().default(true),
  sortOrder,
});
