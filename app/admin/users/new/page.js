import AdminTitle from "../../../../components/admin/AdminTitle";
import AddUserForm from "../../../../components/admin/AddUserForm";
import { requireUserPage } from "../../../../lib/auth/guard";

export const metadata = { title: "Add new user" };

export default async function NewUserPage() {
  await requireUserPage({ roles: ["admin"] });
  return (
    <>
      <AdminTitle role="Admin" title="Add new user" />
      <AddUserForm />
    </>
  );
}
