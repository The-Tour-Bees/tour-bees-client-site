"use client";

import Link from "next/link";
import { useState } from "react";
import { sendJson } from "../../lib/client/post";
import Field, { inputProps } from "../auth/Field";

// events: [{ id, title, basePriceBdt, seatsLeft }]. Hosts only get their own events and cannot book anything else.
export default function BookingForm({ events, canBookOther }) {
  const [productType, setProductType] = useState(events.length ? "event" : "other");
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [travellers, setTravellers] = useState("1");
  const [amount, setAmount] = useState(events[0] ? String(events[0].basePriceBdt) : "");
  const [amountTouched, setAmountTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fe, setFe] = useState({});
  const [done, setDone] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const event = events.find((e) => e.id === eventId);
  const suggest = (id, n) => {
    const ev = events.find((x) => x.id === id);
    if (ev && !amountTouched) setAmount(String(ev.basePriceBdt * (Number(n) || 1)));
  };

  async function submit(e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    setFe({});
    const { ok, data } = await sendJson("/api/bookings", { ...values, productType, eventId, travellers, amountBdt: amount });
    setBusy(false);
    if (!ok) {
      setFe(data.fieldErrors ?? {});
      return setError(data.error ?? "Something went wrong. Please try again.");
    }
    setDone(data);
  }

  if (done) {
    return (
      <div className="panel admin-done" role="status">
        <h2>Booking created</h2>
        <p>Reference <strong>{done.ref}</strong>. It is pending until our team confirms it.</p>
        <div className="admin-actions">
          <Link href="/admin/bookings" className="btn btn--primary">See bookings</Link>
          <button type="button" className="btn btn--ghost" onClick={() => { setDone(null); setFormKey((k) => k + 1); setAmountTouched(false); }}>Add another</button>
        </div>
      </div>
    );
  }

  if (!events.length && !canBookOther) {
    return <p className="empty">No events are assigned to you yet.</p>;
  }

  return (
    <form key={formKey} className="admin-form" onSubmit={submit} noValidate>
      <fieldset className="panel admin-fieldset">
        <legend>Booking</legend>
        {canBookOther && events.length > 0 && (
          <div className="form__field form__field--full">
            <span className="form__label">What is it for?</span>
            <div className="tabs-nav" role="radiogroup" aria-label="Booking type">
              {[["event", "An event"], ["other", "A trip, hotel or houseboat"]].map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={productType === v} className={productType === v ? "tabs-nav__link tabs-nav__link--on" : "tabs-nav__link"} onClick={() => setProductType(v)}>{l}</button>
              ))}
            </div>
          </div>
        )}
        {productType === "event" ? (
          <Field id="eventId" label="Event" required full error={fe.eventId} hint={event?.seatsLeft != null ? `${event.seatsLeft} seats left` : undefined}>
            <select {...inputProps("eventId", fe.eventId)} value={eventId} onChange={(e) => { setEventId(e.target.value); suggest(e.target.value, travellers); }}>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </Field>
        ) : (
          <Field id="title" label="What is it? (trip, hotel or houseboat name)" required full error={fe.title}>
            <input {...inputProps("title", fe.title)} type="text" autoComplete="off" />
          </Field>
        )}
        <Field id="travellers" label="Travellers" required error={fe.travellers}>
          <input {...inputProps("travellers", fe.travellers)} type="number" min="1" value={travellers} onChange={(e) => { setTravellers(e.target.value); suggest(eventId, e.target.value); }} />
        </Field>
        <Field id="amountBdt" label="Total amount (BDT)" required error={fe.amountBdt}>
          <input {...inputProps("amountBdt", fe.amountBdt)} type="number" min="0" value={amount} onChange={(e) => { setAmount(e.target.value); setAmountTouched(true); }} />
        </Field>
      </fieldset>

      <fieldset className="panel admin-fieldset">
        <legend>Guest</legend>
        <Field id="guestName" label="Guest name" required error={fe.guestName}><input {...inputProps("guestName", fe.guestName)} type="text" autoComplete="off" /></Field>
        <Field id="guestMobile" label="Mobile / WhatsApp" required error={fe.guestMobile}><input {...inputProps("guestMobile", fe.guestMobile)} type="tel" placeholder="+8801XXXXXXXXX" autoComplete="off" /></Field>
        <Field id="guestEmail" label="Email" error={fe.guestEmail}><input {...inputProps("guestEmail", fe.guestEmail)} type="email" autoComplete="off" /></Field>
        <Field id="notes" label="Notes" full error={fe.notes}><textarea {...inputProps("notes", fe.notes)} rows={3} /></Field>
      </fieldset>

      {error && <div className="form__alert" role="alert">{error}</div>}
      <div className="admin-actions">
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : "Create booking"}</button>
        <Link href="/admin/bookings" className="btn btn--ghost">Cancel</Link>
      </div>
    </form>
  );
}
