import AdminTitle from "../../../../components/admin/AdminTitle";
import EventForm from "../../../../components/admin/EventForm";
import { requireUserPage } from "../../../../lib/auth/guard";
import { connectDb } from "../../../../lib/db";
import User from "../../../../models/User";

export const metadata = { title: "Add event" };

export default async function NewEventPage() {
  await requireUserPage({ roles: ["admin"] });
  await connectDb();
  const hosts = (await User.find({ accountType: "host", approvalStatus: "approved" }).sort({ fullName: 1 }).lean()).map((h) => ({ id: String(h._id), fullName: h.fullName }));
  return (
    <>
      <AdminTitle role="Admin" title="Add event" />
      <EventForm hosts={hosts} />
    </>
  );
}
