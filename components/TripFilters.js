import { DURATIONS, SORT_OPTIONS } from "../lib/trips";
import Select from "./Select";

// Plain GET form, so filters work without JavaScript and results are shareable links.
export default function TripFilters({ action, destinations, values }) {
  const active = values.q || values.destination || values.duration || values.sort;

  return (
    <form className="filters" method="get" action={action}>
      <input className="form__input" type="search" name="q" placeholder="Search trips" aria-label="Search trips" defaultValue={values.q} />
      {destinations.length > 0 && (
        <Select
          name="destination"
          ariaLabel="Destination"
          defaultValue={values.destination ?? ""}
          options={[{ value: "", label: "All destinations" }, ...destinations.map((d) => ({ value: d, label: d }))]}
        />
      )}
      <Select
        name="duration"
        ariaLabel="Duration"
        defaultValue={values.duration ?? ""}
        options={[{ value: "", label: "Any length" }, ...DURATIONS]}
      />
      <Select name="sort" ariaLabel="Sort by" defaultValue={values.sort ?? "popular"} options={SORT_OPTIONS} />
      <button type="submit" className="btn btn--primary">Apply</button>
      {active && <a href={action} className="filters__clear">Clear</a>}
    </form>
  );
}
