import AdminTitle from "../../../../components/admin/AdminTitle";
import TripForm from "../../../../components/admin/TripForm";
import { requireUserPage } from "../../../../lib/auth/guard";

export const metadata = { title: "Add trip" };

export default async function NewTripPage() {
  await requireUserPage({ roles: ["admin"] });
  return (
    <>
      <AdminTitle role="Admin" title="Add trip" />
      <TripForm />
    </>
  );
}
