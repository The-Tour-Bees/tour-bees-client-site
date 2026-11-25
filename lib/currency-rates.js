// Server-only access to the stored currency rates.
import { DEFAULT_RATES, RATE_CODES, normalizeRates } from "./currency";
import { connectDb } from "./db";
import CurrencyRate from "../models/CurrencyRate";

const find = () => CurrencyRate.find({ code: { $in: RATE_CODES } }).lean();

// Inserts the default rates. Upserts, so two first reads at the same moment cannot create duplicates.
async function seed() {
  await CurrencyRate.init(); // the unique index on code must exist first
  await CurrencyRate.bulkWrite(
    Object.entries(DEFAULT_RATES).map(([code, bdtPerUnit]) => ({
      updateOne: { filter: { code }, update: { $setOnInsert: { bdtPerUnit } }, upsert: true },
    })),
  );
}

// { rates: { USD, EUR, INR }, updatedAt }. Seeds the collection if it is empty.
export async function readCurrencyRates() {
  await connectDb();
  let docs = await find();
  if (docs.length === 0 && !(await CurrencyRate.exists({}))) {
    await seed();
    docs = await find();
  }

  const all = normalizeRates(Object.fromEntries(docs.map((d) => [d.code, d.bdtPerUnit])));
  const rates = Object.fromEntries(RATE_CODES.map((code) => [code, all[code]]));
  const updatedAt = docs.reduce((latest, d) => (d.updatedAt > latest ? d.updatedAt : latest), null);
  return { rates, updatedAt };
}

// Call after connectDb(). Only the codes in RATE_CODES are written, so BDT cannot be changed.
export async function saveCurrencyRates(rates) {
  await CurrencyRate.init();
  await CurrencyRate.bulkWrite(
    RATE_CODES.map((code) => ({
      updateOne: { filter: { code }, update: { $set: { bdtPerUnit: rates[code] } }, upsert: true },
    })),
  );
}
