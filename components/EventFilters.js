import { SORT_OPTIONS } from "../lib/events";

// Plain GET form, so filters work without JavaScript and results are shareable links.
export default function EventFilters({ action, places, values }) {
  const active = values.q || values.place || (values.sort && values.sort !== "date");

  return (
    <form className="filters" method="get" action={action}>
      <input
        className="form__input"
        type="search"
        name="q"
        placeholder="Search events"
        aria-label="Search events"
        defaultValue={values.q}
      />
      {places.length > 0 && (
        <select className="form__input" name="place" aria-label="Place" defaultValue={values.place ?? ""}>
          <option value="">All places</option>
          {places.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      )}
      <select className="form__input" name="sort" aria-label="Sort by" defaultValue={values.sort ?? "date"}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <button type="submit" className="btn btn--primary">Apply</button>
      {active && <a href={action} className="filters__clear">Clear</a>}
    </form>
  );
}
