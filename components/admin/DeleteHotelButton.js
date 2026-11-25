"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "../../lib/client/post";

export default function DeleteHotelButton({ id, name }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusy(true);
    const { ok, data } = await sendJson(`/api/admin/hotels/${id}`, {}, "DELETE");
    setBusy(false);
    if (!ok) return window.alert(data.error ?? "Could not delete. Please try again.");
    router.refresh();
  }

  return <button type="button" className="btn btn--ghost btn--small" onClick={remove} disabled={busy}>{busy ? "Deleting…" : "Delete"}</button>;
}
