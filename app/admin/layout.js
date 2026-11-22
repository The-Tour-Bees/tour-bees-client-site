import { redirect } from "next/navigation";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getCurrentUser } from "../../lib/auth/session";

export const metadata = { title: { default: "Dashboard", template: "%s | The Tour Bees" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="admin-shell">
      <AdminSidebar role={user.accountType} name={user.fullName} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
