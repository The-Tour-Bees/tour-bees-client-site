import { connectDb, hasDatabase } from "./db";
import { todayInDhaka } from "./dates";
import { EVENTS } from "./data/events";
import Event from "../models/Event";

// Status comes from the dates, never from a stored field.
export function eventStatus(event, today = todayInDhaka()) {
  const end = event.endsOn || event.startsOn;
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

// Plain object the pages use, from a stored event.
export function toEvent(doc) {
  return {
    id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    description: doc.description,
    location: doc.location,
    place: doc.place || doc.location,
    startsOn: doc.startsOn,
    endsOn: doc.endsOn || doc.startsOn,
    hostId: doc.hostId?._id ? String(doc.hostId._id) : doc.hostId ? String(doc.hostId) : null,
    hostName: doc.hostId?.fullName,
    basePriceBdt: doc.basePriceBdt,
    seats: doc.seats,
    seatsLeft: doc.seatsLeft,
    images: doc.images ?? [],
    tags: doc.tags ?? [],
    inclusions: doc.inclusions ?? [],
    itinerary: doc.itinerary ?? [],
  };
}

// Events come from MongoDB when it is configured, otherwise from lib/data/events.js.
async function loadPublished() {
  if (!hasDatabase()) return EVENTS;
  try {
    await connectDb();
    const docs = await Event.find({ published: true }).populate("hostId", "fullName").lean();
    return docs.map(toEvent);
  } catch (err) {
    console.error("Could not load events:", err.message);
    return [];
  }
}

export async function listEvents({ status, q, place, sort = "date", limit } = {}) {
  const today = todayInDhaka();
  let items = (await loadPublished()).map(withStatus(today));

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
  const event = (await loadPublished()).find((e) => e.slug === slug);
  return event ? withStatus(todayInDhaka())(event) : null;
}

export async function listEventSlugs() {
  return (await loadPublished()).map((e) => e.slug);
}
