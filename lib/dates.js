const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parse = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, d };
};

// Today as YYYY-MM-DD in Bangladesh time, so event status flips at local midnight.
export const todayInDhaka = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });

export function formatDate(iso) {
  const { y, m, d } = parse(iso);
  return `${d} ${MONTHS[m]} ${y}`;
}

// "12 – 15 Dec 2026", "28 Dec 2026 – 2 Jan 2027", or a single date.
export function formatDateRange(start, end) {
  if (!end || end === start) return formatDate(start);
  const a = parse(start);
  const b = parse(end);
  if (a.y === b.y && a.m === b.m) return `${a.d} – ${b.d} ${MONTHS[b.m]} ${b.y}`;
  if (a.y === b.y) return `${a.d} ${MONTHS[a.m]} – ${b.d} ${MONTHS[b.m]} ${b.y}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}
