import Link from "next/link";
import { notFound } from "next/navigation";
import { getStay, KINDS, parseStayParams, TYPES } from "../lib/stays";
import AccentTitle from "./AccentTitle";
import PriceTag from "./PriceTag";
import RecommendationStrip from "./RecommendationStrip";
import SmartImage from "./SmartImage";
import StayEnquiryForm from "./StayEnquiryForm";
import { related } from "../lib/services/recommendations";

export async function stayMetadata(kind, params) {
  const item = await getStay(kind, (await params).slug);
  if (!item) return { title: "Not found" };
  return {
    title: item.name,
    description: item.summary ?? `${item.name} in ${item.place}.`,
    openGraph: item.images?.[0] ? { images: [item.images[0]] } : undefined,
  };
}

export default async function StayDetail({ kind, params, searchParams }) {
  const cfg = KINDS[kind];
  const item = await getStay(kind, (await params).slug);
  if (!item) notFound();

  const defaults = parseStayParams(await searchParams);
  const more = await related({ kind: kind === "hotels" ? "hotel" : "houseboat", slug: item.slug, place: item.place, tags: item.tags }).catch(() => []);
  const { name, summary, description, place, type, stars, cabins, capacity, dayTrip, basePriceBdt, amenities = [], images = [] } = item;

  return (
    <>
      <section className="detail-hero">
        <div className="container">
          <Link href={cfg.path} className="detail-hero__back">← {kind === "hotels" ? "Hotels and resorts" : "Houseboats"}</Link>
          {type && <span className="badge-status badge-status--domestic badge-status--inline">{TYPES[type]}</span>}
          <h1><AccentTitle text={name} /></h1>
          {summary && <p className="detail-hero__summary">{summary}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container detail-layout">
          <div className="detail-main">
            {images.length > 0 && (
              <div className={images.length > 1 ? "gallery gallery--multi" : "gallery"}>
                {images.slice(0, 5).map((src, i) => (
                  <SmartImage key={src} src={src} alt={i === 0 ? name : ""} priority={i === 0} sizes="(max-width: 860px) 100vw, 60vw" />
                ))}
              </div>
            )}

            {description && (
              <div className="prose">
                <h2>About this {cfg.nameLabel}</h2>
                <p>{description}</p>
              </div>
            )}

            {amenities.length > 0 && (
              <div className="prose">
                <h2>Amenities</h2>
                <ul className="checklist">
                  {amenities.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="detail-aside">
            <div className="panel">
              <p className="detail-aside__price">
                From <PriceTag amountBdt={basePriceBdt} suffix="/ night" />
              </p>
              <dl className="facts">
                <div><dt>Place</dt><dd>{place}</dd></div>
                {stars && <div><dt>Rating</dt><dd aria-label={`${stars} stars`}>{"★".repeat(stars)}</dd></div>}
                {cabins && <div><dt>Cabins</dt><dd>{cabins}</dd></div>}
                {capacity && <div><dt>Capacity</dt><dd>Up to {capacity} guests</dd></div>}
                {dayTrip && <div><dt>Day trips</dt><dd>Available</dd></div>}
              </dl>

              <h2 className="detail-aside__title">Send booking enquiry</h2>
              <StayEnquiryForm kind={kind} item={item} defaults={defaults} />
            </div>
          </aside>
        </div>
      </section>
      <RecommendationStrip items={more} alt />
    </>
  );
}
