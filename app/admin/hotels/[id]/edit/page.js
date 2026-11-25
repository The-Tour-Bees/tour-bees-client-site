import mongoose from "mongoose";
import { notFound } from "next/navigation";
import AdminTitle from "../../../../../components/admin/AdminTitle";
import HotelForm from "../../../../../components/admin/HotelForm";
import { requireUserPage } from "../../../../../lib/auth/guard";
import { connectDb } from "../../../../../lib/db";
import Hotel from "../../../../../models/Hotel";

export const metadata = { title: "Edit hotel" };

export default async function EditHotelPage({ params }) {
  await requireUserPage({ roles: ["admin"] });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDb();
  const doc = await Hotel.findById(id).lean();
  if (!doc) notFound();

  const initial = {
    slug: doc.slug,
    name: doc.name,
    type: doc.type,
    place: doc.place,
    stars: doc.stars ?? "",
    summary: doc.summary,
    description: doc.description,
    basePriceBdt: doc.basePriceBdt,
    amenities: doc.amenities.join("\n"),
    images: doc.images.join("\n"),
    tags: doc.tags.join(", "),
    published: doc.published,
    sortOrder: doc.sortOrder ?? 0,
  };

  return (
    <>
      <AdminTitle role="Admin" title="Edit hotel" />
      <HotelForm id={id} initial={initial} />
    </>
  );
}
