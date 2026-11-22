import { formatDate } from "../lib/dates";
import { carryQuery, KINDS, listPlaces, listStays, parseStayParams } from "../lib/stays";
import PageHero from "./PageHero";
import StayCard from "./StayCard";
import StayEnquiryForm from "./StayEnquiryForm";
import StayFilters from "./StayFilters";

export default async function StaysListing({ kind, searchParams }) {
  const cfg = KINDS[kind];
  const values = parseStayParams(searchParams);
  const [items, places] = await Promise.all([listStays(kind, values), listPlaces(kind)]);
  const filtered = Boolean(values.q || values.place || values.type || (kind === "houseboats" && values.guests));
  const query = carryQuery(values);

  const guests =
    kind === "hotels" && values.adults
      ? `${values.adults} adult${values.adults === 1 ? "" : "s"}${values.children ? `, ${values.children} child${values.children === 1 ? "" : "ren"}` : ""}${values.rooms ? `, ${values.rooms} room${values.rooms === 1 ? "" : "s"}` : ""}`
      : null;

  return (
    <>
      <PageHero title={cfg.title} description={cfg.description}>
        <a href="#enquire" className="btn btn--primary">Send an enquiry</a>
      </PageHero>

      <section className="section">
        <div className="container">
          {(values.checkIn || guests) && (
            <p className="stay-summary">
              Your search:{" "}
              {values.checkIn && values.checkOut ? `${formatDate(values.checkIn)} – ${formatDate(values.checkOut)}` : values.checkIn ? formatDate(values.checkIn) : null}
              {guests && <> · {guests}</>}
            </p>
          )}

          <StayFilters kind={kind} action={cfg.path} places={places} values={values} />

          {items.length === 0 ? (
            <p className="empty">{filtered ? `No ${cfg.noun}s match your filters.` : cfg.empty}</p>
          ) : (
            <div className="grid grid--3">
              {items.map((i) => (
                <StayCard key={i.slug} kind={kind} item={i} query={query} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--alt" id="enquire">
        <div className="container form-wrap">
          <div className="section__head">
            <h2>Send a booking enquiry</h2>
            <p>Tell us your dates and what you need. We will check availability and get back to you.</p>
          </div>
          <div className="panel">
            <StayEnquiryForm kind={kind} defaults={values} />
          </div>
        </div>
      </section>
    </>
  );
}
