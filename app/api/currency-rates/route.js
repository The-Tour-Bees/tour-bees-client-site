import { NextResponse } from "next/server";
import { DEFAULT_RATES } from "../../../lib/currency";
import { readCurrencyRates } from "../../../lib/currency-rates";
import { hasDatabase } from "../../../lib/db";

export const dynamic = "force-dynamic";

const send = (body, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

// { USD, EUR, INR } as BDT per 1 unit. BDT is the base (always 1) and is not listed.
export async function GET() {
  if (!hasDatabase()) return send(DEFAULT_RATES);

  try {
    return send((await readCurrencyRates()).rates);
  } catch (err) {
    console.error("Could not load currency rates:", err.message);
    return send({ error: "Could not load currency rates" }, 500);
  }
}
