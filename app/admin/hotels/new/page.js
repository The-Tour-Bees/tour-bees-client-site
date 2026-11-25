import AdminTitle from "../../../../components/admin/AdminTitle";
import HotelForm from "../../../../components/admin/HotelForm";
import { requireUserPage } from "../../../../lib/auth/guard";

export const metadata = { title: "Add hotel" };

export default async function NewHotelPage() {
  await requireUserPage({ roles: ["admin"] });
  return (
    <>
      <AdminTitle role="Admin" title="Add hotel" />
      <HotelForm />
    </>
  );
}
