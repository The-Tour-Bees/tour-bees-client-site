import Link from "next/link";
import { formatDateRange } from "../lib/dates";
import PriceTag from "./PriceTag";

const BADGES = { upcoming: "Upcoming", ongoing: "Ongoing", previous: "Completed" };

export default function EventCard({ event }) {
  const { slug, title, summary, location, startsOn, endsOn, hostName, basePriceBdt, seatsLeft, images, status } = event;

  return (
    <article className="listing-card">
      <Link href={`/events/${slug}`} className="listing-card__media" aria-label={title}>
        {images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[0]} alt="" loading="lazy" />
        ) : (
          <span className="listing-card__placeholder" aria-hidden="true">{title.slice(0, 1)}</span>
        )}
        <span className={`badge-status badge-status--${status}`}>{BADGES[status]}</span>
      </Link>

      <div className="listing-card__body">
        <p className="listing-card__meta">{formatDateRange(startsOn, endsOn)}</p>
        <h3><Link href={`/events/${slug}`}>{title}</Link></h3>
        {summary && <p className="listing-card__summary">{summary}</p>}
        <p className="listing-card__where">
          {location}
          {hostName && <> · Hosted by {hostName}</>}
        </p>
        <div className="listing-card__foot">
          <PriceTag amountBdt={basePriceBdt} suffix="/ person" />
          {status !== "previous" && seatsLeft != null && (
            <span className="listing-card__seats">{seatsLeft > 0 ? `${seatsLeft} seats left` : "Fully booked"}</span>
          )}
        </div>
      </div>
    </article>
  );
}
