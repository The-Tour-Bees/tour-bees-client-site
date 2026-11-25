"use client";

import Select from "./Select";
import { CURRENCIES } from "../lib/currency";
import { useCurrency } from "./CurrencyProvider";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select
      className="currency"
      rootClassName="select--compact select--right"
      ariaLabel="Currency"
      value={currency}
      onChange={setCurrency}
      options={Object.entries(CURRENCIES).map(([code, { symbol }]) => ({ value: code, label: `${symbol} ${code}` }))}
    />
  );
}
