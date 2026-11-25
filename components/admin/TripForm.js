"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "../../lib/client/post";
import Field, { inputProps } from "../auth/Field";
import Select from "../Select";

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

// initial: values for editing (strings), or undefined for a new trip.
export default function TripForm({ initial, id }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fe, setFe] = useState({});
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const v = initial ?? {};

  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = Object.fromEntries(form);
    values.published = form.get("published") === "on";
    
    setBusy(true);
    setError("");
    setFe({});
    const { ok, data } = await sendJson(id ? `/api/admin/trips/${id}` : "/api/admin/trips", values, id ? "PATCH" : "POST");
    setBusy(false);
    if (!ok) {
      setFe(data.fieldErrors ?? {});
      return setError(data.error ?? "Something went wrong. Please try again.");
    }
    router.push("/admin/trips");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={submit} noValidate>
      <fieldset className="panel admin-fieldset">
        <legend>Trip</legend>
        <Field id="title" label="Title" required full error={fe.title}>
          <input {...inputProps("title", fe.title)} type="text" defaultValue={v.title} onChange={(e) => { if (!slugTouched) setSlug(slugify(e.target.value)); }} />
        </Field>
        <Field id="slug" label="Web address" required error={fe.slug} hint="Used in the trip link">
          <input {...inputProps("slug", fe.slug)} type="text" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} />
        </Field>
        <Field id="scope" label="Scope" required error={fe.scope}>
          <Select {...inputProps("scope", fe.scope)} defaultValue={v.scope ?? "domestic"} options={[{ value: "domestic", label: "Domestic" }, { value: "international", label: "International" }]} />
        </Field>
        <Field id="summary" label="One-line summary" full error={fe.summary}><input {...inputProps("summary", fe.summary)} type="text" defaultValue={v.summary} /></Field>
        <Field id="description" label="Description" full error={fe.description}><textarea {...inputProps("description", fe.description)} rows={5} defaultValue={v.description} /></Field>
      </fieldset>
      <fieldset className="panel admin-fieldset">
        <legend>Where, how long and price</legend>
        <Field id="destination" label="Destination" required error={fe.destination}><input {...inputProps("destination", fe.destination)} type="text" defaultValue={v.destination} /></Field>
        <Field id="durationDays" label="Duration (days)" required error={fe.durationDays}><input {...inputProps("durationDays", fe.durationDays)} type="number" min="1" defaultValue={v.durationDays} /></Field>
        <Field id="basePriceBdt" label="Price per person (BDT)" required error={fe.basePriceBdt}><input {...inputProps("basePriceBdt", fe.basePriceBdt)} type="number" min="0" defaultValue={v.basePriceBdt} /></Field>
        <Field id="sortOrder" label="Sort order" error={fe.sortOrder} hint="Lower numbers appear first"><input {...inputProps("sortOrder", fe.sortOrder)} type="number" defaultValue={v.sortOrder ?? 0} /></Field>
      </fieldset>
      <fieldset className="panel admin-fieldset">
        <legend>Details</legend>
        <Field id="images" label="Image addresses" full error={fe.images} hint="One per line. The first is the main picture."><textarea {...inputProps("images", fe.images)} rows={3} defaultValue={v.images} /></Field>
        <Field id="itinerary" label="Itinerary" full error={fe.itinerary} hint="One line per step: Title | what happens"><textarea {...inputProps("itinerary", fe.itinerary)} rows={4} defaultValue={v.itinerary} /></Field>
        <Field id="inclusions" label="What is included" full error={fe.inclusions} hint="One per line"><textarea {...inputProps("inclusions", fe.inclusions)} rows={3} defaultValue={v.inclusions} /></Field>
        <Field id="exclusions" label="What is not included" full error={fe.exclusions} hint="One per line"><textarea {...inputProps("exclusions", fe.exclusions)} rows={3} defaultValue={v.exclusions} /></Field>
        <Field id="tags" label="Tags" error={fe.tags} hint="Separated by commas"><input {...inputProps("tags", fe.tags)} type="text" defaultValue={v.tags} /></Field>
        <label className="admin-check"><input type="checkbox" name="published" defaultChecked={v.published ?? true} /> Show on the website</label>
      </fieldset>

      {error && <div className="form__alert" role="alert">{error}</div>}
      <div className="admin-actions">
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : id ? "Save changes" : "Create trip"}</button>
        <Link href="/admin/trips" className="btn btn--ghost">Cancel</Link>
      </div>
    </form>
  );
}
