import { SORT_OPTIONS, TYPES } from "../lib/stays";

// Plain GET form. Dates and guests from the home search are kept as hidden fields.
export default function StayFilters({ kind, action, places, values }) {
  const active = values.q || values.place || values.type || values.sort || (kind === "houseboats" && values.guests);
  const carried = ["checkIn", "checkOut", "adults", "children", "rooms"].filter((k) => values[k] != null);

  return (
    <form className="filters" method="get" action={action}>
      {carried.map((k) => (
        <input key={k} type="hidden" name={k} value={values[k]} />
      ))}
      <input className="form__input" type="search" name="q" placeholder="Search by name or place" aria-label="Search" defaultValue={values.q} />
      {places.length > 0 && (
        <select className="form__input" name="place" aria-label="Place" defaultValue={values.place ?? ""}>
          <option value="">All places</option>
          {places.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      )}
      {kind === "hotels" && (
        <select className="form__input" name="type" aria-label="Type" defaultValue={values.type ?? ""}>
          <option value="">Hotels and resorts</option>
          {Object.entries(TYPES).map(([k, label]) => (
            <option key={k} value={k}>{label}s</option>
          ))}
        </select>
      )}
      {kind === "houseboats" && (
        <input className="form__input" type="number" name="guests" min="1" max="100" placeholder="Guests" aria-label="Guests" defaultValue={values.guests} />
      )}
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
