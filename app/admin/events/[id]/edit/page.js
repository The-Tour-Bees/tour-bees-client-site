import mongoose from "mongoose";
import { notFound } from "next/navigation";
import AdminTitle from "../../../../../components/admin/AdminTitle";
import EventForm from "../../../../../components/admin/EventForm";
import { requireUserPage } from "../../../../../lib/auth/guard";
import { connectDb } from "../../../../../lib/db";
import Event from "../../../../../models/Event";
import User from "../../../../../models/User";

export const metadata = { title: "Edit event" };

export default async function EditEventPage({ params }) {
  await requireUserPage({ roles: ["admin"] });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDb();
  const [event, hostDocs] = await Promise.all([
    Event.findById(id).lean(),
    User.find({ accountType: "host", approvalStatus: "approved" }).sort({ fullName: 1 }).lean(),
  ]);
  if (!event) notFound();

  const initial = {
    title: event.title,
    slug: event.slug,
    summary: event.summary,
    description: event.description,
    location: event.location,
    place: event.place,
    startsOn: event.startsOn,
    endsOn: event.endsOn,
    hostId: event.hostId ? String(event.hostId) : "",
    basePriceBdt: event.basePriceBdt,
    seats: event.seats ?? "",
    images: event.images.join("\n"),
    tags: event.tags.join(", "),
    inclusions: event.inclusions.join("\n"),
    itinerary: event.itinerary.map((s) => (s.text ? `${s.title} | ${s.text}` : s.title)).join("\n"),
    published: event.published,
  };

  return (
    <>
      <AdminTitle role="Admin" title="Edit event" />
      <EventForm id={id} initial={initial} hosts={hostDocs.map((h) => ({ id: String(h._id), fullName: h.fullName }))} />
    </>
  );
}
