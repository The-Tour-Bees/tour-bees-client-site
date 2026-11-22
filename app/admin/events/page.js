import Link from "next/link";
import AdminTitle from "../../../components/admin/AdminTitle";
import { requireUserPage } from "../../../lib/auth/guard";
import { formatDateRange } from "../../../lib/dates";
import { connectDb } from "../../../lib/db";
import { eventStatus } from "../../../lib/events";
import { cap, money } from "../../../lib/format";
import Event from "../../../models/Event";

export const metadata = { title: "Events" };

export default async function AdminEventsPage() {
  const user = await requireUserPage({ roles: ["admin", "host"] });
  const isAdmin = user.accountType === "admin";
  await connectDb();
  const events = await Event.find(isAdmin ? {} : { hostId: user._id }).populate("hostId", "fullName").sort({ startsOn: -1 }).lean();

  return (
    <>
      <AdminTitle role={isAdmin ? "Admin" : "Host"} title={isAdmin ? "Events" : "My events"}>
        {isAdmin && <Link href="/admin/events/new" className="btn btn--primary">Add event</Link>}
      </AdminTitle>

      {events.length === 0 ? (
        <p className="empty">{isAdmin ? "No events yet. Add the first one." : "No events are assigned to you yet."}</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Event</th><th scope="col">Dates</th><th scope="col">Location</th>
                {isAdmin && <th scope="col">Host</th>}
                <th scope="col">Price</th><th scope="col">Seats left</th><th scope="col">Status</th>
                {isAdmin && <th scope="col"><span className="sr-only">Actions</span></th>}
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={String(e._id)}>
                  <td className="table__strong">{e.title}{!e.published && <span className="admin-muted"> (hidden)</span>}</td>
                  <td>{formatDateRange(e.startsOn, e.endsOn || e.startsOn)}</td>
                  <td>{e.location}</td>
                  {isAdmin && <td>{e.hostId?.fullName ?? "–"}</td>}
                  <td>{money(e.basePriceBdt)}</td>
                  <td>{e.seatsLeft != null ? `${e.seatsLeft} of ${e.seats}` : "No limit"}</td>
                  <td><span className={`pill pill--${eventStatus(e) === "ongoing" ? "ongoing" : eventStatus(e) === "upcoming" ? "pending" : "completed"}`}>{cap(eventStatus(e))}</span></td>
                  {isAdmin && <td><Link href={`/admin/events/${e._id}/edit`} className="btn btn--ghost btn--small">Edit</Link></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
