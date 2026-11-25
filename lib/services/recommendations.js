import { todayInDhaka } from "../dates";
import { listEvents } from "../events";
import { listStays } from "../stays";
import { listTrips } from "../trips";

// Rule-based recommendations (master_plan.md section 5.2). No ML: filters, place and tag matching,
// season tags, and a score that favours soonest, available and matching items.

const SEASONS = {
  winter: { months: [11, 12, 1, 2], tags: ["winter", "cool", "christmas", "new-year"] },
  monsoon: { months: [6, 7, 8, 9], tags: ["monsoon", "rain", "river", "houseboat"] },
  summer: { months: [3, 4, 5], tags: ["summer", "beach", "hill", "mountain"] },
  autumn: { months: [10], tags: ["autumn", "festival", "nature"] },
};

const lower = (v) => String(v ?? "").trim().toLowerCase();

function seasonTagsFor(from, to) {
  if (!from) return [];
  const months = new Set();
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to || from}T00:00:00Z`);
  for (let d = new Date(start); d <= end && months.size < 12; d.setUTCDate(d.getUTCDate() + 7)) {
    months.add(d.getUTCMonth() + 1);
  }
  months.add(end.getUTCMonth() + 1);
  return Object.values(SEASONS)
    .filter((s) => s.months.some((m) => months.has(m)))
    .flatMap((s) => s.tags);
}

const normalize = {
  event: (e) => ({
    kind: "event",
    href: `/events/${e.slug}`,
    slug: e.slug,
    title: e.title,
    summary: e.summary,
    place: e.place || e.location,
    tags: e.tags ?? [],
    image: e.images?.[0] ?? null,
    basePriceBdt: e.basePriceBdt,
    startsOn: e.startsOn,
    endsOn: e.endsOn,
    status: e.status,
    seatsLeft: e.seatsLeft ?? null,
    raw: e,
  }),
  trip: (t) => ({
    kind: "trip",
    href: `/custom-trip/${t.scope}/${t.slug}`,
    slug: t.slug,
    title: t.title,
    summary: t.summary,
    place: t.destination,
    tags: t.tags ?? [],
    image: t.images?.[0] ?? null,
    basePriceBdt: t.basePriceBdt,
    durationDays: t.durationDays,
    raw: t,
  }),
  hotel: (h) => ({
    kind: "hotel",
    href: `/hotels/${h.slug}`,
    slug: h.slug,
    title: h.name,
    summary: h.summary,
    place: h.place,
    tags: h.tags ?? [],
    image: h.images?.[0] ?? null,
    basePriceBdt: h.basePriceBdt,
    raw: h,
  }),
  houseboat: (h) => ({
    kind: "houseboat",
    href: `/houseboats/${h.slug}`,
    slug: h.slug,
    title: h.name,
    summary: h.summary,
    place: h.place,
    tags: h.tags ?? [],
    image: h.images?.[0] ?? null,
    basePriceBdt: h.basePriceBdt,
    raw: h,
  }),
};

async function loadCandidates() {
  const [events, trips, hotels, houseboats] = await Promise.all([
    listEvents(),
    listTrips(),
    listStays("hotels"),
    listStays("houseboats"),
  ]);
  return [
    ...events.filter((e) => e.status !== "previous").map(normalize.event),
    ...trips.map(normalize.trip),
    ...hotels.map(normalize.hotel),
    ...houseboats.map(normalize.houseboat),
  ];
}

const daysBetween = (a, b) => Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000);

// Score one candidate against the wanted dates and place. Returns { score, reasons } or null to drop it.
function score(item, { from, to, place, today, seasonTags }) {
  let points = 0;
  const reasons = [];

  if (item.kind === "event") {
    if (item.seatsLeft === 0) return null; // fully booked is not a recommendation
    const end = item.endsOn || item.startsOn;
    if (from) {
      const winEnd = to || from;
      if (item.startsOn > winEnd || end < from) return null; // outside the window
      points += 40;
      reasons.push("Happening in your dates");
    }
    // Soonest first: up to 30 points, fading over 90 days.
    const wait = Math.max(0, daysBetween(today, item.startsOn));
    points += Math.max(0, 30 - Math.floor(wait / 3));
    if (item.status === "ongoing") points += 5;
    if (item.seatsLeft != null && item.seatsLeft > 0 && item.seatsLeft <= 5) {
      points += 4;
      reasons.push("Few seats left");
    } else if (item.seatsLeft != null) {
      points += 2; // confirmed availability
    }
  } else if (from && seasonTags.length) {
    // Trips and stays have no fixed dates, so use the season of the chosen dates.
    const hits = item.tags.filter((t) => seasonTags.includes(lower(t))).length;
    if (hits) {
      points += 10 + hits * 4;
      reasons.push("Good for this season");
    }
  }

  if (place) {
    const wanted = lower(place);
    const where = lower(item.place);
    if (where === wanted) {
      points += 50;
      reasons.push(`In ${item.place}`);
    } else if (where && (where.includes(wanted) || wanted.includes(where))) {
      points += 35;
      reasons.push(`Near ${place}`);
    } else if (item.tags.some((t) => lower(t) === wanted)) {
      points += 25;
      reasons.push(`Tagged ${place}`);
    } else if (lower(item.title).includes(wanted) || lower(item.summary).includes(wanted)) {
      points += 15;
    } else {
      return null; // a place was asked for and this does not relate to it
    }
  }

  return { score: points, reasons };
}

const KIND_ORDER = { event: 0, trip: 1, hotel: 2, houseboat: 3 };

// Public shape: no raw records, so it can go straight into a JSON response.
const publicShape = ({ raw, ...rest }) => rest;

/**
 * Recommend events, trips and stays for a date window and/or a place.
 * With no input, returns the soonest events followed by featured trips and stays.
 */
export async function recommend({ from, to, place, limit = 6, perKind } = {}) {
  const today = todayInDhaka();
  const seasonTags = seasonTagsFor(from, to);
  const candidates = await loadCandidates();

  let ranked = candidates
    .map((item) => {
      const result = score(item, { from, to, place, today, seasonTags });
      return result ? { item, ...result } : null;
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.score - a.score ||
        KIND_ORDER[a.item.kind] - KIND_ORDER[b.item.kind] ||
        (a.item.startsOn ?? "").localeCompare(b.item.startsOn ?? ""),
    );

  if (perKind) {
    const seen = {};
    ranked = ranked.filter(({ item }) => (seen[item.kind] = (seen[item.kind] ?? 0) + 1) <= perKind);
  }

  return ranked.slice(0, limit).map(({ item, reasons }) => ({ ...publicShape(item), reasons }));
}

/**
 * "You may also like" for a detail page: same place first, then shared tags, never the item itself.
 * `kind` is event | trip | hotel | houseboat.
 */
export async function related({ kind, slug, place, tags = [], limit = 3 }) {
  const wantedTags = new Set(tags.map(lower));
  const wantedPlace = lower(place);
  const candidates = (await loadCandidates()).filter((c) => !(c.kind === kind && c.slug === slug));

  return candidates
    .map((item) => {
      let points = 0;
      if (wantedPlace && lower(item.place) === wantedPlace) points += 40;
      points += item.tags.filter((t) => wantedTags.has(lower(t))).length * 8;
      if (item.kind === kind) points += 3; // same type reads as more relevant
      if (item.kind === "event") {
        if (item.seatsLeft === 0) return null;
        points += Math.max(0, 10 - Math.floor(Math.max(0, daysBetween(todayInDhaka(), item.startsOn)) / 10));
      }
      return { item, points };
    })
    .filter(Boolean)
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map(({ item }) => publicShape(item));
}
