import Link from "next/link";
import AdminTitle from "../../../components/admin/AdminTitle";
import DeleteTripButton from "../../../components/admin/DeleteTripButton";
import { requireUserPage } from "../../../lib/auth/guard";
import { connectDb } from "../../../lib/db";
import { cap, money } from "../../../lib/format";
import Trip from "../../../models/Trip";

export const metadata = { title: "Trips" };
export const dynamic = "force-dynamic";

export default async function AdminTripsPage() {
  await requireUserPage({ roles: ["admin"] });
  await connectDb();
  const items = await Trip.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();

  return (
    <>
      <AdminTitle role="Admin" title="Trips">
        <Link href="/admin/trips/new" className="btn btn--primary">Add trip</Link>
      </AdminTitle>

      {items.length === 0 ? (
        <p className="empty">No trips yet. Add the first one.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Title</th><th scope="col">Slug</th><th scope="col">Scope</th><th scope="col">Destination</th>
                <th scope="col">Price</th><th scope="col">Status</th><th scope="col">Order</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={String(t._id)}>
                  <td className="table__strong">{t.title}</td>
                  <td>{t.slug}</td>
                  <td>{cap(t.scope)}</td>
                  <td>{t.destination}</td>
                  <td>{money(t.basePriceBdt)}</td>
                  <td><span className={`pill pill--${t.published ? "completed" : "pending"}`}>{t.published ? "Published" : "Hidden"}</span></td>
                  <td>{t.sortOrder ?? 0}</td>
                  <td>
                    <Link href={`/admin/trips/${t._id}/edit`} className="btn btn--ghost btn--small">Edit</Link>{" "}
                    <DeleteTripButton id={String(t._id)} name={t.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
