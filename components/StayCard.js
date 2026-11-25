import Link from "next/link";
import { TYPES } from "../lib/stays";
import PriceTag from "./PriceTag";
import SmartImage from "./SmartImage";

export default function StayCard({ kind, item, query = "" }) {
  const { slug, name, summary, place, type, stars, cabins, capacity, basePriceBdt, images } = item;
  const href = `/${kind}/${slug}${query}`;
  const facts = [
    stars ? "★".repeat(stars) : null,
    cabins ? `${cabins} cabins` : null,
    capacity ? `up to ${capacity} guests` : null,
  ].filter(Boolean);

  return (
    <article className="listing-card">
      <Link href={href} className="listing-card__media" aria-label={name}>
        {images?.[0] ? (
          <SmartImage src={images[0]} fill sizes="(max-width: 860px) 100vw, 33vw" />
        ) : (
          <span className="listing-card__placeholder" aria-hidden="true">{name.slice(0, 1)}</span>
        )}
        {type && <span className="badge-status badge-status--domestic">{TYPES[type]}</span>}
      </Link>

      <div className="listing-card__body">
        <p className="listing-card__meta">{place}</p>
        <h3><Link href={href}>{name}</Link></h3>
        {summary && <p className="listing-card__summary">{summary}</p>}
        {facts.length > 0 && <p className="listing-card__where">{facts.join(" · ")}</p>}
        <div className="listing-card__foot">
          <PriceTag amountBdt={basePriceBdt} suffix="/ night" />
        </div>
      </div>
    </article>
  );
}
