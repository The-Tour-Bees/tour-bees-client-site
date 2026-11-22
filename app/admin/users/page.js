import Link from "next/link";
import AdminTitle from "../../../components/admin/AdminTitle";
import UserActions from "../../../components/admin/UserActions";
import { connectDb } from "../../../lib/db";
import { requireUserPage } from "../../../lib/auth/guard";
import User from "../../../models/User";

export const metadata = { title: "Users" };

const TYPES = ["host", "agent", "member"];
const LABEL = { host: "Host", agent: "Agent", member: "Member", admin: "Admin" };
const one = (v) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function UsersPage({ searchParams }) {
  const admin = await requireUserPage({ roles: ["admin"] });
  const sp = await searchParams;
  const type = TYPES.includes(one(sp.type)) ? one(sp.type) : undefined;
  const approval = one(sp.approval) === "pending" ? "pending" : undefined;

  await connectDb();
  const [users, pending] = await Promise.all([
    User.find({ ...(type && { accountType: type }), ...(approval && { approvalStatus: approval }) }).sort({ createdAt: -1 }).limit(200),
    User.countDocuments({ approvalStatus: "pending" }),
  ]);

  const tab = (href, label, on) => (
    <Link href={href} className={on ? "tabs-nav__link tabs-nav__link--on" : "tabs-nav__link"} aria-current={on ? "page" : undefined}>{label}</Link>
  );

  return (
    <>
      <AdminTitle role="Admin" title="Users and approvals">
        <Link href="/admin/users/new" className="btn btn--primary">Add new user</Link>
      </AdminTitle>

      <div className="admin-toolbar">
        <nav className="tabs-nav" aria-label="Filter by type">
          {tab("/admin/users", "All", !type && !approval)}
          {TYPES.map((t) => tab(`/admin/users?type=${t}`, `${LABEL[t]}s`, type === t))}
        </nav>
        <Link href="/admin/users?approval=pending" className={approval ? "admin-pill admin-pill--on" : "admin-pill"}>
          Waiting for approval · {pending}
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="empty">No users match.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th><th scope="col">Type</th><th scope="col">Username</th><th scope="col">Mobile</th>
                <th scope="col">Status</th><th scope="col">Approval</th><th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="table__strong">{u.fullName}</td>
                  <td>{LABEL[u.accountType]}</td>
                  <td>{u.username}</td>
                  <td>{u.mobile}</td>
                  <td>{u.status === "active" ? "Active" : "Inactive"}</td>
                  <td><span className={`pill pill--${u.approvalStatus}`}>{u.approvalStatus[0].toUpperCase() + u.approvalStatus.slice(1)}</span></td>
                  <td><UserActions id={u.id} approvalStatus={u.approvalStatus} status={u.status} isSelf={u.id === String(admin._id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
