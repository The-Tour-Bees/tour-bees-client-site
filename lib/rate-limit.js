import { NextResponse } from "next/server";

// In-memory token bucket per IP and route. No dependencies.
// Each server instance keeps its own counts, so on serverless hosting this slows abuse down
// rather than enforcing an exact global limit.
export const STRICT_PER_MINUTE = 5; // enquiries, bookings, sign-in and one-time codes
export const GENERAL_PER_MINUTE = 20; // other public POSTs

const WINDOW_MS = 60 * 1000;
const MAX_BUCKETS = 10_000;
const buckets = new Map();

// Vercel sets these headers itself. Behind another host, the proxy must overwrite them,
// otherwise a visitor can choose their own address.
export function clientIp(request) {
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

// A bucket untouched for a full window has refilled, so forgetting it changes nothing.
function prune(now) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.at >= WINDOW_MS) buckets.delete(key);
  }
  // Still full (a flood of different addresses): drop the least recently used.
  for (const key of buckets.keys()) {
    if (buckets.size < MAX_BUCKETS) break;
    buckets.delete(key);
  }
}

// Takes one token. Returns 0 when allowed, otherwise the seconds to wait.
export function takeToken(key, perMinute, now = Date.now()) {
  let bucket = buckets.get(key);
  if (bucket) buckets.delete(key); // re-inserted below, which keeps the Map in least-recently-used order
  else {
    if (buckets.size >= MAX_BUCKETS) prune(now);
    bucket = { tokens: perMinute, at: now };
  }

  bucket.tokens = Math.min(perMinute, bucket.tokens + ((now - bucket.at) * perMinute) / WINDOW_MS);
  bucket.at = now;
  buckets.set(key, bucket);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return 0;
  }
  return Math.ceil(((1 - bucket.tokens) * WINDOW_MS) / perMinute / 1000);
}

// For route handlers: returns a 429 response to send back, or null to carry on.
export function rateLimit(request, route, perMinute = STRICT_PER_MINUTE) {
  const wait = takeToken(`${route}:${clientIp(request)}`, perMinute);
  if (!wait) return null;
  return NextResponse.json(
    { error: `Too many attempts. Please wait ${wait} second${wait === 1 ? "" : "s"} and try again.` },
    { status: 429, headers: { "Retry-After": String(wait) } },
  );
}
