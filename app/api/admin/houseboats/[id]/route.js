import mongoose from "mongoose";
import { z } from "zod";
import Houseboat from "../../../../../models/Houseboat";
import { begin, handleError, json } from "../../../../../lib/auth/api";
import { apiUser } from "../../../../../lib/auth/guard";
import { houseboatSchema } from "../../../../../lib/houseboat-input";

export async function PATCH(request, { params }) {
  try {
    const { data, response } = await begin(request, houseboatSchema);
    if (response) return response;
    const { error } = await apiUser(["admin"]);
    if (error) return error;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return json({ error: "Houseboat not found." }, 404);
    const doc = await Houseboat.findById(id);
    if (!doc) return json({ error: "Houseboat not found." }, 404);

    Object.assign(doc, {
      slug: data.slug,
      name: data.name,
      place: data.place,
      summary: data.summary,
      description: data.description,
      dayTrip: data.dayTrip,
      basePriceBdt: data.basePriceBdt,
      amenities: data.amenities,
      images: data.images,
      tags: data.tags,
      published: data.published,
      sortOrder: data.sortOrder,
    });
    doc.cabins = data.cabins ?? undefined;
    doc.capacity = data.capacity ?? undefined;

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
    if (!mongoose.isValidObjectId(id)) return json({ error: "Houseboat not found." }, 404);
    const doc = await Houseboat.findByIdAndDelete(id);
    if (!doc) return json({ error: "Houseboat not found." }, 404);
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
