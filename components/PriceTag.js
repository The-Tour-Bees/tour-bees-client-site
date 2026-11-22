"use client";

import { formatPrice } from "../lib/currency";
import { useCurrency } from "./CurrencyProvider";

// amountBdt is the stored base price; it is shown in the visitor's chosen currency.
export default function PriceTag({ amountBdt, suffix, className = "price" }) {
  const { currency } = useCurrency();

  return (
    <span className={className}>
      <span className="price__amount">{formatPrice(amountBdt, currency)}</span>
      {suffix && <span className="price__suffix"> {suffix}</span>}
    </span>
  );
}
