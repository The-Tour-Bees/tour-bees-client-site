import AdminTitle from "../../../../components/admin/AdminTitle";
import BookingForm from "../../../../components/admin/BookingForm";
import { requireUserPage } from "../../../../lib/auth/guard";
import { todayInDhaka } from "../../../../lib/dates";
import { connectDb } from "../../../../lib/db";
import Event from "../../../../models/Event";

export const metadata = { title: "New booking" };

export default async function NewBookingPage() {
  const user = await requireUserPage({ roles: ["admin", "host", "agent"] });
  await connectDb();
  const filter = { published: true, $or: [{ endsOn: { $gte: todayInDhaka() } }, { endsOn: "" }] };
  if (user.accountType === "host") filter.hostId = user._id;
  const docs = await Event.find(filter).sort({ startsOn: 1 }).lean();
  const events = docs.map((e) => ({ id: String(e._id), title: e.title, basePriceBdt: e.basePriceBdt, seatsLeft: e.seatsLeft ?? null }));

  return (
    <>
      <AdminTitle role={user.accountType === "host" ? "Host" : user.accountType === "agent" ? "Agent" : "Admin"} title="New booking" />
      <BookingForm events={events} canBookOther={user.accountType !== "host"} />
    </>
  );
}
