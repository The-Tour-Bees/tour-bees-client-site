"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "../../lib/client/post";

const STATUSES = ["new", "contacted", "confirmed", "closed", "cancelled"];

// e: { id, type, name, mobile, email, when, status, notes, details: [[label, value]] }
export default function EnquiryRow({ e }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(e.notes);
  const [status, setStatus] = useState(e.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(body) {
    setBusy(true);
    setError("");
    const { ok, data } = await sendJson(`/api/admin/enquiries/${e.id}`, body, "PATCH");
    setBusy(false);
    if (!ok) return setError(data.error ?? "Could not save.");
    router.refresh();
  }

  return (
    <article className="enquiry">
      <div className="enquiry__head">
        <div>
          <p className="enquiry__type">{e.type}</p>
          <h3>{e.name}</h3>
          <p className="admin-muted">{e.mobile}{e.email && ` · ${e.email}`} · {e.when}</p>
        </div>
        <select className="table__select" aria-label="Enquiry status" value={status} disabled={busy} onChange={(ev) => { setStatus(ev.target.value); save({ status: ev.target.value }); }}>
          {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <button type="button" className="enquiry__toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? "Hide details" : "Show details and notes"}</button>
      {open && (
        <div className="enquiry__body">
          <dl className="facts">
            {e.details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          <label className="form__label" htmlFor={`notes-${e.id}`}>Team notes</label>
          <textarea id={`notes-${e.id}`} className="form__input" rows={3} value={notes} onChange={(ev) => setNotes(ev.target.value)} />
          <div className="admin-actions">
            <button type="button" className="btn btn--ghost btn--small" disabled={busy} onClick={() => save({ notes })}>Save notes</button>
            {error && <span className="form__error">{error}</span>}
          </div>
        </div>
      )}
    </article>
  );
}
