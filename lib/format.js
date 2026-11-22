import { formatDate } from "./dates";
import { formatPrice } from "./currency";

export const money = (amountBdt) => formatPrice(amountBdt, "BDT");

// A stored timestamp as a date in Bangladesh time.
export const dateOf = (d) => formatDate(new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }));

export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
