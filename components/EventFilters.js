import { SORT_OPTIONS } from "../lib/events";
import Select from "./Select";

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
        <Select
          name="place"
          ariaLabel="Place"
          defaultValue={values.place ?? ""}
          options={[{ value: "", label: "All places" }, ...places.map((p) => ({ value: p, label: p }))]}
        />
      )}
      <Select name="sort" ariaLabel="Sort by" defaultValue={values.sort ?? "date"} options={SORT_OPTIONS} />
      <button type="submit" className="btn btn--primary">Apply</button>
      {active && <a href={action} className="filters__clear">Clear</a>}
    </form>
  );
}
