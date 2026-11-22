import PageHero from "../../../components/PageHero";
import { SITE } from "../../../lib/site";

export const metadata = {
  title: "Booking Conditions",
  description: `Booking conditions for enquiries, payments, changes and cancellations with ${SITE.name}.`,
};

// TODO: replace every "to be confirmed" with the company's real policy before launch.
const SECTIONS = [
  {
    title: "Enquiries and confirmation",
    text: "Hotel, resort and houseboat requests on this website are enquiries, not confirmed bookings. A booking is confirmed only when our team confirms it to you directly.",
  },
  {
    title: "Prices and currency",
    text: "Prices are shown in BDT, USD, EUR or INR. Converted prices are a guide and may change with exchange rates. The final price is the one confirmed by our team.",
  },
  {
    title: "Payments",
    text: "Payment methods and deadlines are given when your booking is confirmed. Details to be confirmed.",
  },
  {
    title: "Changes",
    text: "To change dates, guests or rooms, contact us as early as you can. Changes depend on availability. Details to be confirmed.",
  },
  {
    title: "Cancellation and refunds",
    text: "Cancellation terms and refund rules differ by event, trip and stay. Details to be confirmed.",
  },
  {
    title: "EMI payments",
    text: "Paying for a tour package in instalments by credit card will be offered soon. Terms to be confirmed.",
  },
  {
    title: "VIP members",
    text: "Member prices and offers apply while membership is active. Details to be confirmed.",
  },
  {
    title: "Your responsibilities",
    text: "Please give accurate details for every traveller and carry the identity documents your trip requires.",
  },
];

export default function BookingConditionsPage() {
  return (
    <>
      <PageHero title="Booking Conditions" description="Please read these conditions before you send an enquiry or book with us." />

      <section className="section">
        <div className="container prose">
          <p className="notice">
            Draft: these conditions are still being finalised by {SITE.name}. Sections marked
            &ldquo;to be confirmed&rdquo; will be completed before launch.
          </p>
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
