import { NextResponse } from "next/server";
import { z } from "zod";
import { recommend } from "../../../lib/services/recommendations";

export const dynamic = "force-dynamic";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v), "Not a real date");

const query = z
  .object({
    from: isoDate.optional(),
    to: isoDate.optional(),
    place: z.string().trim().min(1).max(80).optional(),
    limit: z.coerce.number().int().min(1).max(24).default(6),
  })
  .refine((q) => !q.to || q.from, { message: "'to' needs 'from'", path: ["to"] })
  .refine((q) => !q.from || !q.to || q.to >= q.from, { message: "'to' must not be before 'from'", path: ["to"] });

export async function GET(request) {
  const params = Object.fromEntries(
    [...new URL(request.url).searchParams.entries()].filter(([, v]) => v !== ""),
  );
  const parsed = query.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", issues: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })) },
      { status: 400 },
    );
  }

  try {
    const items = await recommend(parsed.data);
    return NextResponse.json({ items }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (err) {
    console.error("Recommendations failed:", err.message);
    return NextResponse.json({ error: "Could not load recommendations" }, { status: 500 });
  }
}
