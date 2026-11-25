"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Select from "../Select";
import { sendJson } from "../../lib/client/post";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export default function BookingStatusSelect({ id, status }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function change(next) {
    if (next === "cancelled" && !window.confirm("Cancel this booking? The seats go back and any commission is cancelled.")) {
      return;
    }
    setValue(next);
    setBusy(true);
    setError("");
    const { ok, data } = await sendJson(`/api/bookings/${id}`, { status: next }, "PATCH");
    setBusy(false);
    if (!ok) {
      setValue(status);
      return setError(data.error ?? "Could not update.");
    }
    router.refresh();
  }

  if (status === "cancelled") return <span className="pill pill--cancelled">Cancelled</span>;

  return (
    <>
      <Select
        className="table__select"
        rootClassName="select--compact"
        ariaLabel="Booking status"
        value={value}
        onChange={change}
        disabled={busy}
        options={STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
      />
      {error && <span className="form__error">{error}</span>}
    </>
  );
}
