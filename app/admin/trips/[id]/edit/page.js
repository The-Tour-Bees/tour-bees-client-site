import mongoose from "mongoose";
import { notFound } from "next/navigation";
import AdminTitle from "../../../../../components/admin/AdminTitle";
import TripForm from "../../../../../components/admin/TripForm";
import { requireUserPage } from "../../../../../lib/auth/guard";
import { connectDb } from "../../../../../lib/db";
import Trip from "../../../../../models/Trip";

export const metadata = { title: "Edit trip" };

export default async function EditTripPage({ params }) {
  await requireUserPage({ roles: ["admin"] });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDb();
  const doc = await Trip.findById(id).lean();
  if (!doc) notFound();

  const initial = {
    slug: doc.slug,
    scope: doc.scope,
    title: doc.title,
    summary: doc.summary,
    description: doc.description,
    destination: doc.destination,
    durationDays: doc.durationDays,
    basePriceBdt: doc.basePriceBdt,
    images: doc.images.join("\n"),
    tags: doc.tags.join(", "),
    inclusions: doc.inclusions.join("\n"),
    exclusions: doc.exclusions.join("\n"),
    itinerary: doc.itinerary.map((s) => (s.text ? `${s.title} | ${s.text}` : s.title)).join("\n"),
    published: doc.published,
    sortOrder: doc.sortOrder ?? 0,
  };

  return (
    <>
      <AdminTitle role="Admin" title="Edit trip" />
      <TripForm id={id} initial={initial} />
    </>
  );
}
