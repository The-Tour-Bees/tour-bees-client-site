import AdminTitle from "../../../components/admin/AdminTitle";
import ChangePasswordForm from "../../../components/admin/ChangePasswordForm";
import { requireUserPage } from "../../../lib/auth/guard";

export const metadata = { title: "Profile" };

const ROLE = { admin: "Admin", host: "Host", agent: "Agent", member: "Member" };

export default async function ProfilePage({ searchParams }) {
  const user = await requireUserPage({ allowForced: true });
  const forced = user.mustChangePassword || (await searchParams).forced === "1";

  return (
    <>
      <AdminTitle role={ROLE[user.accountType]} title="Your profile" />
      <div className="admin-two">
        <section className="panel" aria-label="Your details">
          <h2>Your details</h2>
          <dl className="facts">
            <div><dt>Name</dt><dd>{user.fullName}</dd></div>
            <div><dt>Username</dt><dd>{user.username}</dd></div>
            <div><dt>Email</dt><dd>{user.email}</dd></div>
            <div><dt>Mobile</dt><dd>{user.mobile}</dd></div>
            {user.accountType === "agent" && user.agent?.commissionPercent != null && <div><dt>Commission</dt><dd>{user.agent.commissionPercent}%</dd></div>}
            {user.accountType === "member" && <div><dt>Membership</dt><dd>{user.member?.tier === "vip" ? "VIP" : "Regular"}{user.member?.expiresAt && ` · until ${user.member.expiresAt}`}</dd></div>}
          </dl>
        </section>
        <ChangePasswordForm forced={user.mustChangePassword && forced} />
      </div>
    </>
  );
}
