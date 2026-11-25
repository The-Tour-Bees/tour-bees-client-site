import Link from "next/link";
import { formatDateRange } from "../lib/dates";
import PriceTag from "./PriceTag";
import SmartImage from "./SmartImage";

const KIND_LABEL = { event: "Event", trip: "Trip", hotel: "Hotel / Resort", houseboat: "Houseboat" };
const SUFFIX = { event: "/ person", trip: "/ person", hotel: "/ night", houseboat: "/ night" };

function RecCard({ item }) {
  const { href, title, summary, place, image, basePriceBdt, kind, startsOn, endsOn, reasons = [] } = item;
  return (
    <article className="listing-card">
      <Link href={href} className="listing-card__media" aria-label={title}>
        {image ? (
          <SmartImage src={image} fill sizes="(max-width: 860px) 100vw, 33vw" />
        ) : (
          <span className="listing-card__placeholder" aria-hidden="true">{title.slice(0, 1)}</span>
        )}
        <span className="badge-status badge-status--domestic">{KIND_LABEL[kind]}</span>
      </Link>
      <div className="listing-card__body">
        <p className="listing-card__meta">{kind === "event" && startsOn ? formatDateRange(startsOn, endsOn) : place}</p>
        <h3><Link href={href}>{title}</Link></h3>
        {summary && <p className="listing-card__summary">{summary}</p>}
        <p className="listing-card__where">
          {kind === "event" ? place : reasons[0] ?? ""}
        </p>
        <div className="listing-card__foot">
          <PriceTag amountBdt={basePriceBdt} suffix={SUFFIX[kind]} />
        </div>
      </div>
    </article>
  );
}

// Renders nothing when there is nothing to recommend, so pages never show an empty heading.
export default function RecommendationStrip({ items, title = "You may also like", description, alt = false }) {
  if (!items?.length) return null;
  return (
    <section className={alt ? "section section--alt" : "section"} aria-label={title}>
      <div className="container">
        <div className="section__head">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <div className="grid grid--3">
          {items.map((item) => (
            <RecCard key={`${item.kind}:${item.slug}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
