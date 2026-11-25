import Link from "next/link";
import AdminTitle from "../../../components/admin/AdminTitle";
import DeleteHotelButton from "../../../components/admin/DeleteHotelButton";
import { requireUserPage } from "../../../lib/auth/guard";
import { connectDb } from "../../../lib/db";
import { cap, money } from "../../../lib/format";
import Hotel from "../../../models/Hotel";

export const metadata = { title: "Hotels" };
export const dynamic = "force-dynamic";

export default async function AdminHotelsPage() {
  await requireUserPage({ roles: ["admin"] });
  await connectDb();
  const items = await Hotel.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();

  return (
    <>
      <AdminTitle role="Admin" title="Hotels">
        <Link href="/admin/hotels/new" className="btn btn--primary">Add hotel</Link>
      </AdminTitle>

      {items.length === 0 ? (
        <p className="empty">No hotels yet. Add the first one.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th><th scope="col">Slug</th><th scope="col">Place</th>
                <th scope="col">Price</th><th scope="col">Status</th><th scope="col">Order</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={String(t._id)}>
                  <td className="table__strong">{t.name}</td>
                  <td>{t.slug}</td>
                  
                  <td>{t.place}</td>
                  <td>{money(t.basePriceBdt)}</td>
                  <td><span className={`pill pill--${t.published ? "completed" : "pending"}`}>{t.published ? "Published" : "Hidden"}</span></td>
                  <td>{t.sortOrder ?? 0}</td>
                  <td>
                    <Link href={`/admin/hotels/${t._id}/edit`} className="btn btn--ghost btn--small">Edit</Link>{" "}
                    <DeleteHotelButton id={String(t._id)} name={t.name} />
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
