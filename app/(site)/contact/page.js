import EnquiryForm from "../../../components/EnquiryForm";
import PageHero from "../../../components/PageHero";
import { SITE } from "../../../lib/site";

export const metadata = {
  title: "Contact Us",
  description: `Get in touch with ${SITE.name}. Call, message on WhatsApp, email or send us a message.`,
};

const FIELDS = [
  { name: "name", label: "Full name", required: true, autoComplete: "name" },
  { name: "mobile", label: "Mobile / WhatsApp", type: "tel", required: true, autoComplete: "tel", placeholder: "+8801XXXXXXXXX" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  {
    name: "subject",
    label: "What is this about?",
    type: "select",
    options: ["General question", "Event", "Customized trip", "Hotel / resort", "Houseboat", "Other"],
  },
  { name: "message", label: "Message", type: "textarea", required: true, full: true },
];

export default function ContactPage() {
  const { phone, whatsapp, email, address } = SITE.contact;
  const whatsappDigits = whatsapp.replace(/\D/g, "");
  const hasInfo = phone || whatsapp || email || address;

  return (
    <>
      <PageHero title="Contact Us" description="Questions, ideas or a trip in mind? Send us a message and we will reply soon." />

      <section className="section">
        <div className={hasInfo ? "container contact-layout" : "container contact-layout contact-layout--single"}>
          {hasInfo && (
            <div>
              <h2 className="contact-title">Reach us directly</h2>
              <ul className="info-list">
                {phone && (
                  <li>
                    <span>Phone</span>
                    <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
                  </li>
                )}
                {whatsapp && (
                  <li>
                    <span>WhatsApp</span>
                    <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer">{whatsapp}</a>
                  </li>
                )}
                {email && (
                  <li>
                    <span>Email</span>
                    <a href={`mailto:${email}`}>{email}</a>
                  </li>
                )}
                {address && (
                  <li>
                    <span>Address</span>
                    <p>{address}</p>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="panel">
            <h2 className="contact-title">Send us a message</h2>
            <EnquiryForm
              type="contact"
              fields={FIELDS}
              submitLabel="Send message"
              successText="We have received your message and will get back to you soon."
            />
          </div>
        </div>
      </section>
    </>
  );
}
