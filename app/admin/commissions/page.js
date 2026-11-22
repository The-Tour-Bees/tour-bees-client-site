import AdminTitle from "../../../components/admin/AdminTitle";
import MarkPaidButton from "../../../components/admin/MarkPaidButton";
import StatusPill from "../../../components/admin/StatusPill";
import { sum } from "../../../lib/admin-data";
import { requireUserPage } from "../../../lib/auth/guard";
import { connectDb } from "../../../lib/db";
import { dateOf, money } from "../../../lib/format";
import Commission from "../../../models/Commission";

export const metadata = { title: "Commissions" };

export default async function CommissionsPage() {
  const user = await requireUserPage({ roles: ["admin", "agent"] });
  const isAdmin = user.accountType === "admin";
  await connectDb();

  const rows = await Commission.find(isAdmin ? {} : { agentId: user._id })
    .populate("agentId", "fullName")
    .populate("bookingId", "ref guest travellers amountBdt product")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const due = sum(rows.filter((r) => r.status === "due"), "amountBdt");
  const paid = sum(rows.filter((r) => r.status === "paid"), "amountBdt");

  return (
    <>
      <AdminTitle role={isAdmin ? "Admin" : "Agent"} title={isAdmin ? "Commissions" : "Your commission"} />
      <div className="admin-cards">
        <div className="admin-card admin-card--accent admin-card--static"><span className="admin-card__label">Due</span><span className="admin-card__value">{money(due)}</span></div>
        <div className="admin-card admin-card--static"><span className="admin-card__label">Paid</span><span className="admin-card__value">{money(paid)}</span></div>
      </div>

      {rows.length === 0 ? (
        <p className="empty">No commission yet.</p>
      ) : (
        <div className="table-wrap admin-gap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                {isAdmin && <th scope="col">Agent</th>}
                <th scope="col">Booking</th><th scope="col">Sale</th><th scope="col">Rate</th><th scope="col">Commission</th><th scope="col">Status</th>
                {isAdmin && <th scope="col"><span className="sr-only">Actions</span></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r._id)}>
                  <td>{dateOf(r.createdAt)}</td>
                  {isAdmin && <td className="table__strong">{r.agentId?.fullName ?? "–"}</td>}
                  <td>{r.bookingId ? `${r.bookingId.ref} · ${r.bookingId.product.title}` : "–"}</td>
                  <td>{r.bookingId ? money(r.bookingId.amountBdt) : "–"}</td>
                  <td>{r.percent}%</td>
                  <td>{money(r.amountBdt)}</td>
                  <td><StatusPill status={r.status} /></td>
                  {isAdmin && <td>{r.status === "due" && <MarkPaidButton id={String(r._id)} />}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
