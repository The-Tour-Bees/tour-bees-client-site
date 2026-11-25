"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "../../lib/client/post";
import Field, { inputProps } from "../auth/Field";
import Select from "../Select";

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

// initial: values for editing (strings), or undefined for a new hotel.
export default function HotelForm({ initial, id }) {
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
    const { ok, data } = await sendJson(id ? `/api/admin/hotels/${id}` : "/api/admin/hotels", values, id ? "PATCH" : "POST");
    setBusy(false);
    if (!ok) {
      setFe(data.fieldErrors ?? {});
      return setError(data.error ?? "Something went wrong. Please try again.");
    }
    router.push("/admin/hotels");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={submit} noValidate>
      <fieldset className="panel admin-fieldset">
        <legend>Hotel</legend>
        <Field id="name" label="Name" required full error={fe.name}>
          <input {...inputProps("name", fe.name)} type="text" defaultValue={v.name} onChange={(e) => { if (!slugTouched) setSlug(slugify(e.target.value)); }} />
        </Field>
        <Field id="slug" label="Web address" required error={fe.slug} hint="Used in the link: /hotels/…">
          <input {...inputProps("slug", fe.slug)} type="text" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} />
        </Field>
        <Field id="type" label="Type" required error={fe.type}>
          <Select {...inputProps("type", fe.type)} defaultValue={v.type ?? "hotel"} options={[{ value: "hotel", label: "Hotel" }, { value: "resort", label: "Resort" }]} />
        </Field>
        <Field id="summary" label="One-line summary" full error={fe.summary}><input {...inputProps("summary", fe.summary)} type="text" defaultValue={v.summary} /></Field>
        <Field id="description" label="Description" full error={fe.description}><textarea {...inputProps("description", fe.description)} rows={5} defaultValue={v.description} /></Field>
      </fieldset>
      <fieldset className="panel admin-fieldset">
        <legend>Where and price</legend>
        <Field id="place" label="Place" required error={fe.place}><input {...inputProps("place", fe.place)} type="text" defaultValue={v.place} /></Field>
        <Field id="stars" label="Stars" error={fe.stars} hint="1 to 5, optional"><input {...inputProps("stars", fe.stars)} type="number" min="1" max="5" defaultValue={v.stars} /></Field>
        <Field id="basePriceBdt" label="Price per night (BDT)" required error={fe.basePriceBdt}><input {...inputProps("basePriceBdt", fe.basePriceBdt)} type="number" min="0" defaultValue={v.basePriceBdt} /></Field>
        <Field id="sortOrder" label="Sort order" error={fe.sortOrder} hint="Lower numbers appear first"><input {...inputProps("sortOrder", fe.sortOrder)} type="number" defaultValue={v.sortOrder ?? 0} /></Field>
      </fieldset>
      <fieldset className="panel admin-fieldset">
        <legend>Details</legend>
        <Field id="images" label="Image addresses" full error={fe.images} hint="One per line. The first is the main picture."><textarea {...inputProps("images", fe.images)} rows={3} defaultValue={v.images} /></Field>
        <Field id="amenities" label="Amenities" full error={fe.amenities} hint="One per line"><textarea {...inputProps("amenities", fe.amenities)} rows={3} defaultValue={v.amenities} /></Field>
        <Field id="tags" label="Tags" error={fe.tags} hint="Separated by commas"><input {...inputProps("tags", fe.tags)} type="text" defaultValue={v.tags} /></Field>
        <label className="admin-check"><input type="checkbox" name="published" defaultChecked={v.published ?? true} /> Show on the website</label>
      </fieldset>

      {error && <div className="form__alert" role="alert">{error}</div>}
      <div className="admin-actions">
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : id ? "Save changes" : "Create hotel"}</button>
        <Link href="/admin/hotels" className="btn btn--ghost">Cancel</Link>
      </div>
    </form>
  );
}
