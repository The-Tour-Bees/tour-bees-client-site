// Prices are stored once in BDT and converted for display.
// The bdtPerUnit values below are only the starting rates. Admins manage the live ones at /admin/rates
// (models/CurrencyRate.js); these seed the database and are the fallback when it cannot be read.

export const CURRENCIES = {
  BDT: { symbol: "৳", name: "Bangladeshi Taka", locale: "en-IN", bdtPerUnit: 1 },
  USD: { symbol: "$", name: "US Dollar", locale: "en-US", bdtPerUnit: 122 },
  EUR: { symbol: "€", name: "Euro", locale: "en-US", bdtPerUnit: 132 },
  INR: { symbol: "₹", name: "Indian Rupee", locale: "en-IN", bdtPerUnit: 1.46 },
};

export const DEFAULT_CURRENCY = "BDT";
export const BASE_CURRENCY = "BDT"; // prices are stored in this, so its rate is always 1

export const isCurrency = (code) => Object.hasOwn(CURRENCIES, code);

// The currencies whose rate can be changed.
export const RATE_CODES = Object.keys(CURRENCIES).filter((code) => code !== BASE_CURRENCY);

export const isRate = (value) => Number.isFinite(value) && value > 0;

export const DEFAULT_RATES = Object.fromEntries(RATE_CODES.map((code) => [code, CURRENCIES[code].bdtPerUnit]));

// A complete { code: bdtPerUnit } map: valid values from input, defaults for the rest, BDT forced to 1.
export function normalizeRates(input) {
  const rates = Object.fromEntries(RATE_CODES.map((code) => [code, isRate(input?.[code]) ? input[code] : DEFAULT_RATES[code]]));
  return { ...rates, [BASE_CURRENCY]: 1 };
}

export function convertFromBdt(amountBdt, code = DEFAULT_CURRENCY, rates) {
  if (code === BASE_CURRENCY) return amountBdt;
  return amountBdt / (rates?.[code] ?? CURRENCIES[code].bdtPerUnit);
}

export function formatPrice(amountBdt, code = DEFAULT_CURRENCY, rates) {
  const { symbol, locale } = CURRENCIES[code];
  const value = Math.round(convertFromBdt(amountBdt, code, rates));
  return `${symbol}${value.toLocaleString(locale)}`;
}
