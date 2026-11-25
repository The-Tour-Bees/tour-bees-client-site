import Link from "next/link";
import AdminTitle from "../../../components/admin/AdminTitle";
import DeleteHouseboatButton from "../../../components/admin/DeleteHouseboatButton";
import { requireUserPage } from "../../../lib/auth/guard";
import { connectDb } from "../../../lib/db";
import { cap, money } from "../../../lib/format";
import Houseboat from "../../../models/Houseboat";

export const metadata = { title: "Houseboats" };
export const dynamic = "force-dynamic";

export default async function AdminHouseboatsPage() {
  await requireUserPage({ roles: ["admin"] });
  await connectDb();
  const items = await Houseboat.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();

  return (
    <>
      <AdminTitle role="Admin" title="Houseboats">
        <Link href="/admin/houseboats/new" className="btn btn--primary">Add houseboat</Link>
      </AdminTitle>

      {items.length === 0 ? (
        <p className="empty">No houseboats yet. Add the first one.</p>
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
                    <Link href={`/admin/houseboats/${t._id}/edit`} className="btn btn--ghost btn--small">Edit</Link>{" "}
                    <DeleteHouseboatButton id={String(t._id)} name={t.name} />
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
