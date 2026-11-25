import mongoose from "mongoose";
import { notFound } from "next/navigation";
import AdminTitle from "../../../../../components/admin/AdminTitle";
import HouseboatForm from "../../../../../components/admin/HouseboatForm";
import { requireUserPage } from "../../../../../lib/auth/guard";
import { connectDb } from "../../../../../lib/db";
import Houseboat from "../../../../../models/Houseboat";

export const metadata = { title: "Edit houseboat" };

export default async function EditHouseboatPage({ params }) {
  await requireUserPage({ roles: ["admin"] });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDb();
  const doc = await Houseboat.findById(id).lean();
  if (!doc) notFound();

  const initial = {
    slug: doc.slug,
    name: doc.name,
    place: doc.place,
    summary: doc.summary,
    description: doc.description,
    cabins: doc.cabins ?? "",
    capacity: doc.capacity ?? "",
    dayTrip: doc.dayTrip,
    basePriceBdt: doc.basePriceBdt,
    amenities: doc.amenities.join("\n"),
    images: doc.images.join("\n"),
    tags: doc.tags.join(", "),
    published: doc.published,
    sortOrder: doc.sortOrder ?? 0,
  };

  return (
    <>
      <AdminTitle role="Admin" title="Edit houseboat" />
      <HouseboatForm id={id} initial={initial} />
    </>
  );
}
