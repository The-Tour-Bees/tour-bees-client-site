import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "../db";
import { AuthNotConfigured, authConfigured } from "./session";
import { sameOriginError } from "./guard";
import { normalizeMobile } from "./password";
import User from "../../models/User";

export const json = (body, status = 200) => NextResponse.json(body, { status });

export const notConfigured = () => json({ error: "Sign-in is not set up yet." }, 503);

// Shared start of every auth route: origin check, setup check, JSON body parsed with a schema.
export async function begin(request, schema) {
  const blocked = sameOriginError(request);
  if (blocked) return { response: blocked };
  if (!authConfigured()) return { response: notConfigured() };

  let body;
  try {
    body = await request.json();
  } catch {
    return { response: json({ error: "Invalid request." }, 400) };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, v[0]]),
    );
    return { response: json({ error: "Please check the highlighted fields.", fieldErrors }, 400) };
  }

  await connectDb();
  return { data: parsed.data };
}

// Turns "mobile or email" input into a User lookup.
export function findByIdentifier(identifier, { withPassword = false } = {}) {
  const value = identifier.trim();
  const query = value.includes("@") ? { email: value.toLowerCase() } : { mobile: normalizeMobile(value) };
  const q = User.findOne(query);
  return withPassword ? q.select("+passwordHash") : q;
}

export function handleError(err) {
  if (err instanceof AuthNotConfigured) return notConfigured();
  console.error(err);
  return json({ error: "Something went wrong. Please try again." }, 500);
}
