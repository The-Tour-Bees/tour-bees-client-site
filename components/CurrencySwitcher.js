"use client";

import { CURRENCIES } from "../lib/currency";
import { useCurrency } from "./CurrencyProvider";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      className="currency"
      aria-label="Currency"
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
    >
      {Object.entries(CURRENCIES).map(([code, { symbol }]) => (
        <option key={code} value={code}>
          {symbol} {code}
        </option>
      ))}
    </select>
  );
}
