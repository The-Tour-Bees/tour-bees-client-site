import { z } from "zod";
import { RATE_CODES } from "./currency";

// Body of PUT /api/admin/currency-rates. Unknown keys, including BDT, are dropped.
const rate = (code) => {
  const message = `Enter a ${code} rate greater than 0`;
  return z.number({ error: message }).positive(message);
};

export const currencyRatesSchema = z.object({
  rates: z.object(Object.fromEntries(RATE_CODES.map((code) => [code, rate(code)])), { error: "Enter the currency rates" }),
});
