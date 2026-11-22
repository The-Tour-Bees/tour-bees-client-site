import Link from "next/link";
import AdminTitle from "../../components/admin/AdminTitle";
import { connectDb } from "../../lib/db";
import { requireUserPage } from "../../lib/auth/guard";
import User from "../../models/User";

const INTRO = {
  admin: "Approve new accounts and add hosts, agents and members.",
  host: "Your events and guest bookings will appear here.",
  agent: "Your sales and commission will appear here.",
  member: "Your bookings, VIP offers and member prices will appear here.",
};
const ROLE = { admin: "Admin", host: "Host", agent: "Agent", member: "Member" };

export default async function AdminHome() {
  const user = await requireUserPage();
  let pending = 0;
  let total = 0;
  if (user.accountType === "admin") {
    await connectDb();
    [pending, total] = await Promise.all([User.countDocuments({ approvalStatus: "pending" }), User.countDocuments()]);
  }

  return (
    <>
      <AdminTitle role={ROLE[user.accountType]} title={`Welcome ${user.fullName.split(" ")[0]}`} />
      <p className="admin-lede">{INTRO[user.accountType]}</p>

      {user.accountType === "admin" ? (
        <div className="admin-cards">
          <Link href="/admin/users?approval=pending" className="admin-card admin-card--accent">
            <span className="admin-card__label">Waiting for approval</span>
            <span className="admin-card__value">{pending}</span>
          </Link>
          <Link href="/admin/users" className="admin-card">
            <span className="admin-card__label">All users</span>
            <span className="admin-card__value">{total}</span>
          </Link>
        </div>
      ) : (
        <p className="admin-card admin-card--note">Your dashboard is being built. For now you can manage your profile and password.</p>
      )}
    </>
  );
}
