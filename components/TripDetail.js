import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDuration, getTrip, SCOPES } from "../lib/trips";
import EnquiryForm from "./EnquiryForm";
import PriceTag from "./PriceTag";

export async function tripMetadata(scope, params) {
  const trip = await getTrip((await params).slug);
  if (!trip || trip.scope !== scope) return { title: "Trip not found" };
  return {
    title: trip.title,
    description: trip.summary ?? `${trip.title}, ${formatDuration(trip.durationDays)} in ${trip.destination}.`,
    openGraph: trip.images?.[0] ? { images: [trip.images[0]] } : undefined,
  };
}

export default async function TripDetail({ scope, params }) {
  const trip = await getTrip((await params).slug);
  if (!trip || trip.scope !== scope) notFound();

  const { title, summary, description, destination, durationDays, basePriceBdt, images = [], inclusions = [], exclusions = [], itinerary = [] } = trip;

  const fields = [
    { name: "name", label: "Full name", required: true, autoComplete: "name" },
    { name: "mobile", label: "Mobile / WhatsApp", type: "tel", required: true, autoComplete: "tel", placeholder: "+8801XXXXXXXXX" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "travellers", label: "Travellers", type: "number", required: true, placeholder: "2" },
    { name: "startDate", label: "Preferred start date", type: "date" },
    { name: "message", label: "Message (optional)", type: "textarea", full: true },
  ];

  return (
    <>
      <section className="detail-hero">
        <div className="container">
          <Link href={`/custom-trip/${scope}`} className="detail-hero__back">← {SCOPES[scope].label} trips</Link>
          <span className={`badge-status badge-status--${scope} badge-status--inline`}>{SCOPES[scope].label}</span>
          <h1>{title}</h1>
          {summary && <p className="detail-hero__summary">{summary}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container detail-layout">
          <div className="detail-main">
            {images.length > 0 && (
              <div className={images.length > 1 ? "gallery gallery--multi" : "gallery"}>
                {images.slice(0, 5).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt={i === 0 ? title : ""} loading={i === 0 ? "eager" : "lazy"} />
                ))}
              </div>
            )}

            {description && (
              <div className="prose">
                <h2>About this trip</h2>
                <p>{description}</p>
              </div>
            )}

            {itinerary.length > 0 && (
              <div className="prose">
                <h2>Itinerary</h2>
                <ol className="itinerary">
                  {itinerary.map((step) => (
                    <li key={step.title}>
                      <strong>{step.title}</strong>
                      {step.text && <p>{step.text}</p>}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {inclusions.length > 0 && (
              <div className="prose">
                <h2>What is included</h2>
                <ul className="checklist">
                  {inclusions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {exclusions.length > 0 && (
              <div className="prose">
                <h2>Not included</h2>
                <ul className="checklist checklist--no">
                  {exclusions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="detail-aside">
            <div className="panel">
              <p className="detail-aside__price">
                From <PriceTag amountBdt={basePriceBdt} suffix="/ person" />
              </p>
              <dl className="facts">
                <div><dt>Destination</dt><dd>{destination}</dd></div>
                <div><dt>Duration</dt><dd>{formatDuration(durationDays)}</dd></div>
                <div><dt>Type</dt><dd>{SCOPES[scope].label}</dd></div>
              </dl>

              <h2 className="detail-aside__title">Enquire about this trip</h2>
              <EnquiryForm
                type="custom_trip"
                hidden={{
                  tripSlug: trip.slug,
                  tripTitle: title,
                  destination,
                  scope: SCOPES[scope].label,
                }}
                fields={fields}
                submitLabel="Send enquiry"
                successTitle="Enquiry received"
                successText="Thank you. Our team will contact you about this trip soon."
              />
              <p className="form__note">
                Want something different? <Link href={`/custom-trip/${scope}#build`}>Build your own trip</Link>.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
