import AdminTitle from "../../../../components/admin/AdminTitle";
import HouseboatForm from "../../../../components/admin/HouseboatForm";
import { requireUserPage } from "../../../../lib/auth/guard";

export const metadata = { title: "Add houseboat" };

export default async function NewHouseboatPage() {
  await requireUserPage({ roles: ["admin"] });
  return (
    <>
      <AdminTitle role="Admin" title="Add houseboat" />
      <HouseboatForm />
    </>
  );
}
