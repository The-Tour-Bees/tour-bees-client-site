import Link from "next/link";
import { formatDuration, SCOPES } from "../lib/trips";
import PriceTag from "./PriceTag";

export default function TripCard({ trip }) {
  const { slug, scope, title, summary, destination, durationDays, basePriceBdt, images } = trip;
  const href = `/custom-trip/${scope}/${slug}`;

  return (
    <article className="listing-card">
      <Link href={href} className="listing-card__media" aria-label={title}>
        {images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[0]} alt="" loading="lazy" />
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
