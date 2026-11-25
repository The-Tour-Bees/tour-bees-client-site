import AdminTitle from "../../../components/admin/AdminTitle";
import RatesForm from "../../../components/admin/RatesForm";
import { requireUserPage } from "../../../lib/auth/guard";
import { readCurrencyRates } from "../../../lib/currency-rates";

export const metadata = { title: "Currency rates" };

const stamp = (d) => new Date(d).toLocaleString("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" });

export default async function RatesPage() {
  await requireUserPage({ roles: ["admin"] });
  const { rates, updatedAt } = await readCurrencyRates();

  return (
    <>
      <AdminTitle role="Admin" title="Currency rates" />
      <RatesForm rates={rates} updatedAt={updatedAt ? stamp(updatedAt) : null} />
    </>
  );
}
