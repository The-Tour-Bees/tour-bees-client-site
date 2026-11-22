"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "../../lib/client/post";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export default function BookingStatusSelect({ id, status }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function change(e) {
    const next = e.target.value;
    if (next === "cancelled" && !window.confirm("Cancel this booking? The seats go back and any commission is cancelled.")) {
      e.target.value = status;
      return;
    }
    setBusy(true);
    setError("");
    const { ok, data } = await sendJson(`/api/bookings/${id}`, { status: next }, "PATCH");
    setBusy(false);
    if (!ok) {
      e.target.value = status;
      return setError(data.error ?? "Could not update.");
    }
    router.refresh();
  }

  if (status === "cancelled") return <span className="pill pill--cancelled">Cancelled</span>;

  return (
    <>
      <select className="table__select" aria-label="Booking status" defaultValue={status} onChange={change} disabled={busy}>
        {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
      </select>
      {error && <span className="form__error">{error}</span>}
    </>
  );
}
