import { loadContent } from "./content";
import { TRIPS } from "./data/trips";
import Trip from "../models/Trip";

const loadTrips = () => loadContent(Trip, TRIPS);

export const SCOPES = {
  domestic: { label: "Domestic", title: "Domestic Trips", description: "Customized trips within Bangladesh." },
  international: { label: "International", title: "International Trips", description: "Customized trips abroad." },
};

export const DURATIONS = [
  { value: "short", label: "1–3 days", test: (d) => d <= 3 },
  { value: "week", label: "4–7 days", test: (d) => d >= 4 && d <= 7 },
  { value: "long", label: "8+ days", test: (d) => d >= 8 },
];

export const SORT_OPTIONS = [
  { value: "popular", label: "Featured" },
  { value: "price", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "duration", label: "Duration: shortest" },
];

const SORTS = {
  price: (a, b) => a.basePriceBdt - b.basePriceBdt,
  "price-desc": (a, b) => b.basePriceBdt - a.basePriceBdt,
  duration: (a, b) => a.durationDays - b.durationDays,
};

export function formatDuration(days) {
  return days <= 1 ? "1 day" : `${days} days / ${days - 1} nights`;
}

// Async so these can be swapped for MongoDB queries without touching the pages.
export async function listTrips({ scope, q, destination, duration, sort, limit } = {}) {
  let items = [...(await loadTrips())];

  if (scope) items = items.filter((t) => t.scope === scope);
  if (destination) items = items.filter((t) => t.destination === destination);
  if (duration) {
    const range = DURATIONS.find((d) => d.value === duration);
    if (range) items = items.filter((t) => range.test(t.durationDays));
  }
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter((t) =>
      [t.title, t.summary, t.destination, ...(t.tags ?? [])]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(needle)),
    );
  }
  if (SORTS[sort]) items.sort(SORTS[sort]);

  return limit ? items.slice(0, limit) : items;
}

export async function listDestinations(scope) {
  const items = await listTrips({ scope });
  return [...new Set(items.map((t) => t.destination).filter(Boolean))].sort();
}

export async function getTrip(slug) {
  return (await loadTrips()).find((t) => t.slug === slug) ?? null;
}

export async function listTripPaths() {
  return (await loadTrips()).map((t) => `/custom-trip/${t.scope}/${t.slug}`);
}
