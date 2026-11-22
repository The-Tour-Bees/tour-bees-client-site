import EnquiryForm from "../../../components/EnquiryForm";
import AccentTitle from "../../../components/AccentTitle";
import PageHero from "../../../components/PageHero";

export const metadata = {
  title: "Be a VIP Member",
  description: "Become a VIP member of The Tour Bees for member prices and exclusive offers.",
};

const BENEFITS = [
  { title: "VIP offers", text: "Early access to offers made just for members." },
  { title: "Member prices", text: "Better prices on events, trips and stays." },
  { title: "Your bookings in one place", text: "See your bookings and history whenever you sign in." },
  { title: "Your own profile", text: "Keep your details up to date and manage your account yourself." },
];

const STEPS = [
  { title: "Request membership", text: "Fill in the short form below." },
  { title: "We get in touch", text: "Our team confirms your details and approves your account." },
  { title: "Sign in and save", text: "Use your member account to see offers and prices." },
];

const FIELDS = [
  { name: "name", label: "Full name", required: true, autoComplete: "name" },
  { name: "mobile", label: "Mobile / WhatsApp", type: "tel", required: true, autoComplete: "tel", placeholder: "+8801XXXXXXXXX" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", full: true },
  { name: "message", label: "Anything you would like us to know", type: "textarea", full: true },
];

export default function VipPage() {
  return (
    <>
      <PageHero title="Be a VIP Member" description="Travel with us more often and enjoy member prices and offers." >
        <a href="#join" className="btn btn--primary">Request membership</a>
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2><AccentTitle text="What you get" /></h2>
          </div>
          <div className="grid grid--4">
            {BENEFITS.map((b, i) => (
              <div key={b.title} className="card">
                <div className="card__num">{String(i + 1).padStart(2, "0")}</div>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section__head">
            <h2><AccentTitle text="How it works" /></h2>
          </div>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.title} className="card">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="join">
        <div className="container form-wrap">
          <div className="section__head">
            <h2><AccentTitle text="Request VIP membership" /></h2>
            <p>Membership plans and pricing will be shared when we contact you.</p>
          </div>
          <div className="panel">
            <EnquiryForm
              type="vip"
              fields={FIELDS}
              submitLabel="Request membership"
              successTitle="Request received"
              successText="Thank you. Our team will contact you about VIP membership soon."
            />
          </div>
        </div>
      </section>
    </>
  );
}
