import Link from "next/link";
import AdminTitle from "../../../components/admin/AdminTitle";
import BookingsTable from "../../../components/admin/BookingsTable";
import { commissionAmounts, loadBookings } from "../../../lib/admin-data";
import { requireUserPage } from "../../../lib/auth/guard";
import { connectDb } from "../../../lib/db";

export const metadata = { title: "Bookings" };

const TITLE = { admin: "Bookings", host: "Guest bookings", agent: "My sales", member: "My bookings" };
const ROLE = { admin: "Admin", host: "Host", agent: "Agent", member: "Member" };

export default async function BookingsPage() {
  const user = await requireUserPage();
  const role = user.accountType;
  await connectDb();
  const bookings = await loadBookings(user);
  const commissions = role === "agent" ? await commissionAmounts(user._id, bookings.map((b) => b.id)) : {};

  return (
    <>
      <AdminTitle role={ROLE[role]} title={TITLE[role]}>
        {role !== "member" && <Link href="/admin/bookings/new" className="btn btn--primary">New booking</Link>}
      </AdminTitle>
      <BookingsTable bookings={bookings} role={role} commissionByBooking={commissions} />
    </>
  );
}
