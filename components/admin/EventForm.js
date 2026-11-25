"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "../../lib/client/post";
import Field, { inputProps } from "../auth/Field";
import DatePicker from "../DatePicker";
import Select from "../Select";

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

// initial: values for editing (strings), or undefined for a new event. hosts: [{ id, fullName }].
export default function EventForm({ hosts, initial, id }) {
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
    const { ok, data } = await sendJson(id ? `/api/admin/events/${id}` : "/api/admin/events", values, id ? "PATCH" : "POST");
    setBusy(false);
    if (!ok) {
      setFe(data.fieldErrors ?? {});
      return setError(data.error ?? "Something went wrong. Please try again.");
    }
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={submit} noValidate>
      <fieldset className="panel admin-fieldset">
        <legend>Event</legend>
        <Field id="title" label="Title" required full error={fe.title}>
          <input {...inputProps("title", fe.title)} type="text" defaultValue={v.title} onChange={(e) => { if (!slugTouched) setSlug(slugify(e.target.value)); }} />
        </Field>
        <Field id="slug" label="Web address" required error={fe.slug} hint="Used in the link: /events/…">
          <input {...inputProps("slug", fe.slug)} type="text" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} />
        </Field>
        <Field id="hostId" label="Host" error={fe.hostId}>
          <Select
            {...inputProps("hostId", fe.hostId)}
            defaultValue={v.hostId ?? ""}
            options={[{ value: "", label: "No host yet" }, ...hosts.map((h) => ({ value: h.id, label: h.fullName }))]}
          />
        </Field>
        <Field id="summary" label="One-line summary" full error={fe.summary}><input {...inputProps("summary", fe.summary)} type="text" defaultValue={v.summary} /></Field>
        <Field id="description" label="Description" full error={fe.description}><textarea {...inputProps("description", fe.description)} rows={5} defaultValue={v.description} /></Field>
      </fieldset>

      <fieldset className="panel admin-fieldset">
        <legend>When, where and price</legend>
        <Field id="startsOn" label="Starts on" required error={fe.startsOn}><DatePicker {...inputProps("startsOn", fe.startsOn)} defaultValue={v.startsOn} /></Field>
        <Field id="endsOn" label="Ends on" error={fe.endsOn}><DatePicker {...inputProps("endsOn", fe.endsOn)} defaultValue={v.endsOn} /></Field>
        <Field id="location" label="Location" required error={fe.location}><input {...inputProps("location", fe.location)} type="text" defaultValue={v.location} /></Field>
        <Field id="place" label="Place (for the filter)" error={fe.place} hint="Leave empty to use the location"><input {...inputProps("place", fe.place)} type="text" defaultValue={v.place} /></Field>
        <Field id="basePriceBdt" label="Price per person (BDT)" required error={fe.basePriceBdt}><input {...inputProps("basePriceBdt", fe.basePriceBdt)} type="number" min="0" defaultValue={v.basePriceBdt} /></Field>
        <Field id="seats" label="Seats" error={fe.seats} hint="Leave empty for no limit"><input {...inputProps("seats", fe.seats)} type="number" min="0" defaultValue={v.seats} /></Field>
      </fieldset>

      <fieldset className="panel admin-fieldset">
        <legend>Details</legend>
        <Field id="images" label="Image addresses" full error={fe.images} hint="One per line. The first is the main picture."><textarea {...inputProps("images", fe.images)} rows={3} defaultValue={v.images} /></Field>
        <Field id="itinerary" label="Itinerary" full error={fe.itinerary} hint="One line per step: Title | what happens"><textarea {...inputProps("itinerary", fe.itinerary)} rows={4} defaultValue={v.itinerary} /></Field>
        <Field id="inclusions" label="What is included" full error={fe.inclusions} hint="One per line"><textarea {...inputProps("inclusions", fe.inclusions)} rows={3} defaultValue={v.inclusions} /></Field>
        <Field id="tags" label="Tags" error={fe.tags} hint="Separated by commas"><input {...inputProps("tags", fe.tags)} type="text" defaultValue={v.tags} /></Field>
        <label className="admin-check"><input type="checkbox" name="published" defaultChecked={v.published ?? true} /> Show on the website</label>
      </fieldset>

      {error && <div className="form__alert" role="alert">{error}</div>}
      <div className="admin-actions">
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : id ? "Save changes" : "Create event"}</button>
        <Link href="/admin/events" className="btn btn--ghost">Cancel</Link>
      </div>
    </form>
  );
}
