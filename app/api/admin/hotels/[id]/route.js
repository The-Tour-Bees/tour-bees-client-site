import mongoose from "mongoose";
import { z } from "zod";
import Hotel from "../../../../../models/Hotel";
import { begin, handleError, json } from "../../../../../lib/auth/api";
import { apiUser } from "../../../../../lib/auth/guard";
import { hotelSchema } from "../../../../../lib/hotel-input";

export async function PATCH(request, { params }) {
  try {
    const { data, response } = await begin(request, hotelSchema);
    if (response) return response;
    const { error } = await apiUser(["admin"]);
    if (error) return error;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return json({ error: "Hotel not found." }, 404);
    const doc = await Hotel.findById(id);
    if (!doc) return json({ error: "Hotel not found." }, 404);

    Object.assign(doc, {
      slug: data.slug,
      name: data.name,
      type: data.type,
      place: data.place,
      summary: data.summary,
      description: data.description,
      basePriceBdt: data.basePriceBdt,
      amenities: data.amenities,
      images: data.images,
      tags: data.tags,
      published: data.published,
      sortOrder: data.sortOrder,
    });
    doc.stars = data.stars ?? undefined;

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
    if (!mongoose.isValidObjectId(id)) return json({ error: "Hotel not found." }, 404);
    const doc = await Hotel.findByIdAndDelete(id);
    if (!doc) return json({ error: "Hotel not found." }, 404);
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
