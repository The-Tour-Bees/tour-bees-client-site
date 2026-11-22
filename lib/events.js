import { todayInDhaka } from "./dates";
import { EVENTS } from "./data/events";

// Status comes from the dates, never from a stored field.
export function eventStatus(event, today = todayInDhaka()) {
  const end = event.endsOn ?? event.startsOn;
  if (end < today) return "previous";
  if (event.startsOn <= today) return "ongoing";
  return "upcoming";
}

const withStatus = (today) => (e) => ({ ...e, status: eventStatus(e, today) });

const SORTS = {
  price: (a, b) => a.basePriceBdt - b.basePriceBdt,
  "price-desc": (a, b) => b.basePriceBdt - a.basePriceBdt,
};

export const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "price", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

// All of these are async so they can be swapped for MongoDB queries without touching the pages.
export async function listEvents({ status, q, place, sort = "date", limit } = {}) {
  const today = todayInDhaka();
  let items = EVENTS.map(withStatus(today));

  if (status) items = items.filter((e) => e.status === status);
  if (place) items = items.filter((e) => e.place === place);
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter((e) =>
      [e.title, e.summary, e.location, e.place, e.hostName, ...(e.tags ?? [])]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(needle)),
    );
  }

  const byDate = status === "previous" ? (a, b) => b.startsOn.localeCompare(a.startsOn) : (a, b) => a.startsOn.localeCompare(b.startsOn);
  items.sort(SORTS[sort] ?? byDate);

  return limit ? items.slice(0, limit) : items;
}

export async function listPlaces(status) {
  const items = await listEvents({ status });
  return [...new Set(items.map((e) => e.place).filter(Boolean))].sort();
}

export async function getEvent(slug) {
  const event = EVENTS.find((e) => e.slug === slug);
  return event ? withStatus(todayInDhaka())(event) : null;
}

export async function listEventSlugs() {
  return EVENTS.map((e) => e.slug);
}
