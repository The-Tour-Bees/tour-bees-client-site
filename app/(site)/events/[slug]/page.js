import Link from "next/link";
import { notFound } from "next/navigation";
import EnquiryForm from "../../../../components/EnquiryForm";
import PriceTag from "../../../../components/PriceTag";
import { formatDateRange } from "../../../../lib/dates";
import { getEvent } from "../../../../lib/events";

const BADGES = { upcoming: "Upcoming", ongoing: "Ongoing", previous: "Completed" };

export async function generateMetadata({ params }) {
  const event = await getEvent((await params).slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.summary ?? `${event.title} in ${event.location}, ${formatDateRange(event.startsOn, event.endsOn)}.`,
    openGraph: event.images?.[0] ? { images: [event.images[0]] } : undefined,
  };
}

export default async function EventPage({ params }) {
  const event = await getEvent((await params).slug);
  if (!event) notFound();

  const { title, summary, description, location, startsOn, endsOn, hostName, basePriceBdt, seats, seatsLeft, images = [], inclusions = [], itinerary = [], status } = event;
  const open = status !== "previous" && seatsLeft !== 0;

  const fields = [
    { name: "name", label: "Full name", required: true, autoComplete: "name" },
    { name: "mobile", label: "Mobile / WhatsApp", type: "tel", required: true, autoComplete: "tel", placeholder: "+8801XXXXXXXXX" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "guests", label: "Guests", type: "number", required: true, placeholder: "1" },
    { name: "message", label: "Message (optional)", type: "textarea", full: true },
  ];

  return (
    <>
      <section className="detail-hero">
        <div className="container">
          <Link href={`/events/${status}`} className="detail-hero__back">← {BADGES[status]} events</Link>
          <span className={`badge-status badge-status--${status} badge-status--inline`}>{BADGES[status]}</span>
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
                <h2>About this event</h2>
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
          </div>

          <aside className="detail-aside">
            <div className="panel">
              <p className="detail-aside__price">
                <PriceTag amountBdt={basePriceBdt} suffix="/ person" />
              </p>
              <dl className="facts">
                <div><dt>Dates</dt><dd>{formatDateRange(startsOn, endsOn)}</dd></div>
                <div><dt>Location</dt><dd>{location}</dd></div>
                {hostName && <div><dt>Host</dt><dd>{hostName}</dd></div>}
                {seats != null && <div><dt>Seats</dt><dd>{seatsLeft != null ? `${seatsLeft} of ${seats} left` : seats}</dd></div>}
              </dl>

              {open ? (
                <>
                  <h2 className="detail-aside__title">Enquire about this event</h2>
                  <EnquiryForm
                    type="event"
                    hidden={{ eventSlug: event.slug, eventTitle: title }}
                    fields={fields}
                    submitLabel="Send enquiry"
                    successTitle="Enquiry received"
                    successText="Thank you. Our team will contact you about this event soon."
                  />
                </>
              ) : (
                <p className="notice">
                  {status === "previous"
                    ? "This event has finished."
                    : "This event is fully booked."}{" "}
                  <Link href="/events/upcoming">See upcoming events</Link>
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
