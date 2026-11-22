import { DURATIONS, SORT_OPTIONS } from "../lib/trips";

// Plain GET form, so filters work without JavaScript and results are shareable links.
export default function TripFilters({ action, destinations, values }) {
  const active = values.q || values.destination || values.duration || values.sort;

  return (
    <form className="filters" method="get" action={action}>
      <input className="form__input" type="search" name="q" placeholder="Search trips" aria-label="Search trips" defaultValue={values.q} />
      {destinations.length > 0 && (
        <select className="form__input" name="destination" aria-label="Destination" defaultValue={values.destination ?? ""}>
          <option value="">All destinations</option>
          {destinations.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      )}
      <select className="form__input" name="duration" aria-label="Duration" defaultValue={values.duration ?? ""}>
        <option value="">Any length</option>
        {DURATIONS.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>
      <select className="form__input" name="sort" aria-label="Sort by" defaultValue={values.sort ?? "popular"}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <button type="submit" className="btn btn--primary">Apply</button>
      {active && <a href={action} className="filters__clear">Clear</a>}
    </form>
  );
}
