import Link from "next/link";
import AdminTitle from "../../components/admin/AdminTitle";
import BookingsTable from "../../components/admin/BookingsTable";
import { loadBookings, sum } from "../../lib/admin-data";
import { requireUserPage } from "../../lib/auth/guard";
import { dateOf, money } from "../../lib/format";
import { todayInDhaka, formatDateRange } from "../../lib/dates";
import { connectDb } from "../../lib/db";
import Booking from "../../models/Booking";
import Commission from "../../models/Commission";
import Enquiry from "../../models/Enquiry";
import Event from "../../models/Event";
import User from "../../models/User";

const INTRO = {
  admin: "Approve new accounts, keep an eye on enquiries and bookings.",
  host: "Your events and the guests booked on them.",
  agent: "Your sales and the commission you have earned.",
  member: "Your membership and your bookings.",
};
const ROLE = { admin: "Admin", host: "Host", agent: "Agent", member: "Member" };

const Card = ({ href, label, value, accent }) => (
  <Link href={href} className={accent ? "admin-card admin-card--accent" : "admin-card"}>
    <span className="admin-card__label">{label}</span>
    <span className="admin-card__value">{value}</span>
  </Link>
);

export default async function AdminHome() {
  const user = await requireUserPage();
  await connectDb();
  const role = user.accountType;
  const today = todayInDhaka();
  const monthStart = new Date(`${today.slice(0, 7)}-01T00:00:00+06:00`);

  let body;

  if (role === "admin") {
    const [pending, newEnquiries, pendingBookings, due] = await Promise.all([
      User.countDocuments({ approvalStatus: "pending" }),
      Enquiry.countDocuments({ status: "new" }),
      Booking.countDocuments({ status: "pending" }),
      Commission.find({ status: "due" }).lean(),
    ]);
    body = (
      <div className="admin-cards">
        <Card href="/admin/users?approval=pending" label="Accounts waiting for approval" value={pending} accent={pending > 0} />
        <Card href="/admin/enquiries" label="New enquiries" value={newEnquiries} accent={newEnquiries > 0} />
        <Card href="/admin/bookings" label="Bookings to confirm" value={pendingBookings} />
        <Card href="/admin/commissions" label="Commission due" value={money(sum(due, "amountBdt"))} />
      </div>
    );
  } else if (role === "host") {
    const [events, bookings] = await Promise.all([
      Event.find({ hostId: user._id }).sort({ startsOn: 1 }).lean(),
      loadBookings(user, { limit: 5 }),
    ]);
    const next = events.find((e) => (e.endsOn || e.startsOn) >= today);
    const guests = sum(await Booking.find({ hostId: user._id, status: { $ne: "cancelled" } }).lean().then((r) => r.map((b) => ({ n: b.travellers }))), "n");
    body = (
      <>
        <div className="admin-cards">
          <Card href="/admin/events" label="Events assigned to you" value={events.length} />
          <Card href="/admin/bookings" label="Guests booked" value={guests} />
        </div>
        {next && (
          <section className="admin-card admin-card--static" aria-label="Next event">
            <span className="admin-card__label">{next.startsOn <= today ? "Happening now" : "Next event"}</span>
            <h2 className="admin-card__title">{next.title}</h2>
            <p className="admin-muted">{formatDateRange(next.startsOn, next.endsOn || next.startsOn)} · {next.location}</p>
          </section>
        )}
        <h2 className="admin-section">Recent bookings</h2>
        <BookingsTable bookings={bookings} role="host" />
      </>
    );
  } else if (role === "agent") {
    const [all, dueRows, bookings] = await Promise.all([
      Booking.find({ agentId: user._id, status: { $ne: "cancelled" }, createdAt: { $gte: monthStart } }).lean(),
      Commission.find({ agentId: user._id, status: "due" }).lean(),
      loadBookings(user, { limit: 5 }),
    ]);
    body = (
      <>
        <div className="admin-cards">
          <Card href="/admin/bookings" label="Sales this month" value={money(sum(all, "amountBdt"))} />
          <Card href="/admin/commissions" label="Your commission rate" value={`${user.agent?.commissionPercent ?? 0}%`} />
          <Card href="/admin/commissions" label="Commission due" value={money(sum(dueRows, "amountBdt"))} accent />
        </div>
        <h2 className="admin-section">Recent sales</h2>
        <BookingsTable bookings={bookings} role="host" />
      </>
    );
  } else {
    const bookings = await loadBookings(user, { limit: 5 });
    body = (
      <>
        <section className={user.member?.tier === "vip" ? "admin-card admin-card--accent admin-card--static" : "admin-card admin-card--static"} aria-label="Membership">
          <span className="admin-card__label">Membership</span>
          <h2 className="admin-card__title">{user.member?.tier === "vip" ? "VIP member" : "Member"}</h2>
          {user.member?.expiresAt && <p className="admin-muted">Valid until {dateOf(user.member.expiresAt)}</p>}
        </section>
        <h2 className="admin-section">My bookings</h2>
        <BookingsTable bookings={bookings} role="member" />
        {bookings.length > 0 && <p><Link href="/admin/bookings" className="auth-form__link">See all bookings</Link></p>}
      </>
    );
  }

  return (
    <>
      <AdminTitle role={ROLE[role]} title={`Welcome ${user.fullName.split(" ")[0]}`} />
      <p className="admin-lede">{INTRO[role]}</p>
      {body}
    </>
  );
}
