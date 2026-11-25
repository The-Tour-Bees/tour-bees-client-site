import { SORT_OPTIONS, TYPES } from "../lib/stays";
import Select from "./Select";

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
        <Select
          name="place"
          ariaLabel="Place"
          defaultValue={values.place ?? ""}
          options={[{ value: "", label: "All places" }, ...places.map((p) => ({ value: p, label: p }))]}
        />
      )}
      {kind === "hotels" && (
        <Select
          name="type"
          ariaLabel="Type"
          defaultValue={values.type ?? ""}
          options={[{ value: "", label: "Hotels and resorts" }, ...Object.entries(TYPES).map(([k, label]) => ({ value: k, label: `${label}s` }))]}
        />
      )}
      {kind === "houseboats" && (
        <input className="form__input" type="number" name="guests" min="1" max="100" placeholder="Guests" aria-label="Guests" defaultValue={values.guests} />
      )}
      <Select name="sort" ariaLabel="Sort by" defaultValue={values.sort ?? "popular"} options={SORT_OPTIONS} />
      <button type="submit" className="btn btn--primary">Apply</button>
      {active && <a href={action} className="filters__clear">Clear</a>}
    </form>
  );
}
