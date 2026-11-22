import { HOTELS } from "./data/hotels";
import { HOUSEBOATS } from "./data/houseboats";

// Hotels/resorts and houseboats share the same listing, filter and enquiry pattern.
export const KINDS = {
  hotels: {
    path: "/hotels",
    data: HOTELS,
    title: "Hotel / Resort Booking",
    description: "Tell us where and when, and we will find the right stay for you.",
    noun: "stay",
    nameLabel: "hotel or resort",
    empty: "Hotels and resorts are coming soon. You can still tell us what you need below.",
  },
  houseboats: {
    path: "/houseboats",
    data: HOUSEBOATS,
    title: "Houseboat Booking",
    description: "Relaxed stays on the water, arranged for you and your group.",
    noun: "houseboat",
    nameLabel: "houseboat",
    empty: "Houseboats are coming soon. You can still tell us what you need below.",
  },
};

export const TYPES = { hotel: "Hotel", resort: "Resort" };

export const SORT_OPTIONS = [
  { value: "popular", label: "Featured" },
  { value: "price", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const SORTS = {
  price: (a, b) => a.basePriceBdt - b.basePriceBdt,
  "price-desc": (a, b) => b.basePriceBdt - a.basePriceBdt,
};

// Async so these can be swapped for MongoDB queries without touching the pages.
export async function listStays(kind, { q, place, type, guests, sort, limit } = {}) {
  let items = [...KINDS[kind].data];

  if (place) items = items.filter((i) => i.place === place);
  if (type) items = items.filter((i) => i.type === type);
  if (guests) items = items.filter((i) => i.capacity == null || i.capacity >= guests);
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter((i) =>
      [i.name, i.summary, i.place, ...(i.tags ?? [])].filter(Boolean).some((v) => v.toLowerCase().includes(needle)),
    );
  }
  if (SORTS[sort]) items.sort(SORTS[sort]);

  return limit ? items.slice(0, limit) : items;
}

export async function listPlaces(kind) {
  const items = await listStays(kind);
  return [...new Set(items.map((i) => i.place).filter(Boolean))].sort();
}

export async function getStay(kind, slug) {
  return KINDS[kind].data.find((i) => i.slug === slug) ?? null;
}

export async function listStayPaths() {
  return Object.entries(KINDS).flatMap(([, k]) => k.data.map((i) => `${k.path}/${i.slug}`));
}

const first = (v) => (Array.isArray(v) ? v[0] : v) || undefined;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const num = (v, min, max) => {
  const n = Number.parseInt(first(v), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : undefined;
};

// Search values carried between the home search, the listing and the detail page.
export function parseStayParams(sp) {
  const date = (v) => (DATE.test(first(v) ?? "") ? first(v) : undefined);
  return {
    q: first(sp.q)?.trim() || undefined,
    place: first(sp.place),
    type: first(sp.type),
    sort: first(sp.sort),
    checkIn: date(sp.checkIn),
    checkOut: date(sp.checkOut),
    adults: num(sp.adults, 1, 20),
    children: num(sp.children, 0, 20),
    rooms: num(sp.rooms, 1, 10),
    guests: num(sp.guests, 1, 100),
  };
}

const CARRY = ["checkIn", "checkOut", "adults", "children", "rooms", "guests"];

export function carryQuery(values) {
  const params = new URLSearchParams();
  for (const k of CARRY) if (values[k] != null) params.set(k, String(values[k]));
  const s = params.toString();
  return s ? `?${s}` : "";
}
