import Link from "next/link";
import { formatDuration, SCOPES } from "../lib/trips";
import PriceTag from "./PriceTag";
import SmartImage from "./SmartImage";

export default function TripCard({ trip }) {
  const { slug, scope, title, summary, destination, durationDays, basePriceBdt, images } = trip;
  const href = `/custom-trip/${scope}/${slug}`;

  return (
    <article className="listing-card">
      <Link href={href} className="listing-card__media" aria-label={title}>
        {images?.[0] ? (
          <SmartImage src={images[0]} fill sizes="(max-width: 860px) 100vw, 33vw" />
        ) : (
          <span className="listing-card__placeholder" aria-hidden="true">{title.slice(0, 1)}</span>
        )}
        <span className={`badge-status badge-status--${scope}`}>{SCOPES[scope].label}</span>
      </Link>

      <div className="listing-card__body">
        <p className="listing-card__meta">{formatDuration(durationDays)}</p>
        <h3><Link href={href}>{title}</Link></h3>
        {summary && <p className="listing-card__summary">{summary}</p>}
        <p className="listing-card__where">{destination}</p>
        <div className="listing-card__foot">
          <PriceTag amountBdt={basePriceBdt} suffix="/ person" />
        </div>
      </div>
    </article>
  );
}
