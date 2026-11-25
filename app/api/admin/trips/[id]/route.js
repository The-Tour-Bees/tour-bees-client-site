import mongoose from "mongoose";
import { z } from "zod";
import Trip from "../../../../../models/Trip";
import { begin, handleError, json } from "../../../../../lib/auth/api";
import { apiUser } from "../../../../../lib/auth/guard";
import { tripSchema } from "../../../../../lib/trip-input";

export async function PATCH(request, { params }) {
  try {
    const { data, response } = await begin(request, tripSchema);
    if (response) return response;
    const { error } = await apiUser(["admin"]);
    if (error) return error;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return json({ error: "Trip not found." }, 404);
    const doc = await Trip.findById(id);
    if (!doc) return json({ error: "Trip not found." }, 404);

    Object.assign(doc, {
      slug: data.slug,
      scope: data.scope,
      title: data.title,
      summary: data.summary,
      description: data.description,
      destination: data.destination,
      durationDays: data.durationDays,
      basePriceBdt: data.basePriceBdt,
      images: data.images,
      tags: data.tags,
      inclusions: data.inclusions,
      exclusions: data.exclusions,
      itinerary: data.itinerary,
      published: data.published,
      sortOrder: data.sortOrder,
    });


    try {
      await doc.save();
    } catch (err) {
      if (err?.code === 11000) return json({ error: "Please check the highlighted fields.", fieldErrors: { slug: "That address is already used" } }, 409);
      throw err;
    }
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}

export const PUT = PATCH;

export async function DELETE(request, { params }) {
  try {
    const { response } = await begin(request, z.object({}));
    if (response) return response;
    const { error } = await apiUser(["admin"]);
    if (error) return error;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return json({ error: "Trip not found." }, 404);
    const doc = await Trip.findByIdAndDelete(id);
    if (!doc) return json({ error: "Trip not found." }, 404);
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
