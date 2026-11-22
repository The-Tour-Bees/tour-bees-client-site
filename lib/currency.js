// Prices are stored once in BDT and converted for display.
// TODO: the rates below are placeholders. Replace with the currency_rates table (admin-managed).

export const CURRENCIES = {
  BDT: { symbol: "৳", name: "Bangladeshi Taka", locale: "en-IN", bdtPerUnit: 1 },
  USD: { symbol: "$", name: "US Dollar", locale: "en-US", bdtPerUnit: 122 },
  EUR: { symbol: "€", name: "Euro", locale: "en-US", bdtPerUnit: 132 },
  INR: { symbol: "₹", name: "Indian Rupee", locale: "en-IN", bdtPerUnit: 1.46 },
};

export const DEFAULT_CURRENCY = "BDT";

export const isCurrency = (code) => Object.hasOwn(CURRENCIES, code);

export function convertFromBdt(amountBdt, code = DEFAULT_CURRENCY) {
  return amountBdt / CURRENCIES[code].bdtPerUnit;
}

export function formatPrice(amountBdt, code = DEFAULT_CURRENCY) {
  const { symbol, locale } = CURRENCIES[code];
  const value = Math.round(convertFromBdt(amountBdt, code));
  return `${symbol}${value.toLocaleString(locale)}`;
}
