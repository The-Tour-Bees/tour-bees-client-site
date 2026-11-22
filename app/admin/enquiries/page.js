import Link from "next/link";
import AdminTitle from "../../../components/admin/AdminTitle";
import EnquiryRow from "../../../components/admin/EnquiryRow";
import { requireUserPage } from "../../../lib/auth/guard";
import { connectDb } from "../../../lib/db";
import { cap, dateOf } from "../../../lib/format";
import Enquiry from "../../../models/Enquiry";

export const metadata = { title: "Enquiries" };

const TYPES = { contact: "Contact", vip: "VIP", investor: "Investor", event: "Event", custom_trip: "Customized trip", hotel: "Hotel / resort", houseboat: "Houseboat" };
const LABELS = { eventTitle: "Event", tripTitle: "Trip", hotelName: "Hotel", houseboatName: "Houseboat", checkIn: "Check-in", checkOut: "Check-out", startDate: "From", endDate: "To", stayType: "Type", hotelLevel: "Hotel level", budgetCurrency: "Budget currency" };
const one = (v) => (Array.isArray(v) ? v[0] : v) || undefined;
const label = (k) => LABELS[k] ?? cap(k.replace(/([A-Z])/g, " $1").toLowerCase());

export default async function EnquiriesPage({ searchParams }) {
  await requireUserPage({ roles: ["admin"] });
  const sp = await searchParams;
  const status = ["new", "contacted", "confirmed", "closed", "cancelled"].includes(one(sp.status)) ? one(sp.status) : undefined;

  await connectDb();
  const [docs, newCount] = await Promise.all([
    Enquiry.find(status ? { status } : {}).sort({ createdAt: -1 }).limit(200).lean(),
    Enquiry.countDocuments({ status: "new" }),
  ]);

  const items = docs.map((d) => ({
    id: String(d._id),
    type: TYPES[d.type] ?? d.type,
    name: d.contact.name,
    mobile: d.contact.mobile,
    email: d.contact.email,
    when: dateOf(d.createdAt),
    status: d.status,
    notes: d.notes,
    details: Object.entries(d.payload ?? {}).filter(([, v]) => v !== "" && v != null).map(([k, v]) => [label(k), String(v)]),
  }));

  const tab = (href, text, on) => <Link href={href} className={on ? "tabs-nav__link tabs-nav__link--on" : "tabs-nav__link"} aria-current={on ? "page" : undefined}>{text}</Link>;

  return (
    <>
      <AdminTitle role="Admin" title="Enquiries" />
      <nav className="tabs-nav" aria-label="Filter by status">
        {tab("/admin/enquiries", "All", !status)}
        {tab("/admin/enquiries?status=new", `New · ${newCount}`, status === "new")}
        {tab("/admin/enquiries?status=contacted", "Contacted", status === "contacted")}
        {tab("/admin/enquiries?status=confirmed", "Confirmed", status === "confirmed")}
        {tab("/admin/enquiries?status=closed", "Closed", status === "closed")}
      </nav>
      {items.length === 0 ? <p className="empty">No enquiries here.</p> : <div className="enquiries">{items.map((e) => <EnquiryRow key={e.id} e={e} />)}</div>}
    </>
  );
}
