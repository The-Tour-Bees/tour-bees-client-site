import EnquiryForm from "../../../components/EnquiryForm";
import PageHero from "../../../components/PageHero";

export const metadata = {
  title: "Be an Investor",
  description: "Invest in The Tour Bees. Tell us about your interest and we will get in touch.",
};

// TODO: replace the starter copy with the real investor pitch.
const REASONS = [
  { title: "More than one line of business", text: "Events, customized trips, hotel and resort stays, houseboats and VIP membership." },
  { title: "A community of travellers", text: "Hosts, agents and members who keep coming back to travel with us." },
  { title: "Open conversation", text: "Tell us what you are looking for and we will share the details with you directly." },
];

const FIELDS = [
  { name: "name", label: "Full name", required: true, autoComplete: "name" },
  { name: "mobile", label: "Mobile / WhatsApp", type: "tel", required: true, autoComplete: "tel", placeholder: "+8801XXXXXXXXX" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "company", label: "Company (optional)", autoComplete: "organization" },
  {
    name: "interest",
    label: "Area of interest",
    type: "select",
    options: ["Events", "Trips", "Hotels, resorts and houseboats", "Something else"],
    full: true,
  },
  { name: "message", label: "Message", type: "textarea", full: true },
];

export default function InvestorPage() {
  return (
    <>
      <PageHero title="Be an Investor" description="Grow with The Tour Bees. Start the conversation with our team.">
        <a href="#enquire" className="btn btn--primary">Get in touch</a>
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>Why The Tour Bees</h2>
          </div>
          <div className="grid grid--3">
            {REASONS.map((r, i) => (
              <div key={r.title} className="card">
                <div className="card__num">{String(i + 1).padStart(2, "0")}</div>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt" id="enquire">
        <div className="container form-wrap">
          <div className="section__head">
            <h2>Investor enquiry</h2>
            <p>Share a few details and a member of our team will contact you.</p>
          </div>
          <div className="panel">
            <EnquiryForm
              type="investor"
              fields={FIELDS}
              submitLabel="Send enquiry"
              successTitle="Enquiry received"
              successText="Thank you for your interest. Our team will contact you soon."
            />
          </div>
        </div>
      </section>
    </>
  );
}
