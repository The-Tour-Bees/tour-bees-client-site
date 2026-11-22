"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "../../lib/client/post";

export default function MarkPaidButton({ id }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function go() {
    setBusy(true);
    setError("");
    const { ok, data } = await sendJson(`/api/commissions/${id}`, { action: "markPaid" }, "PATCH");
    setBusy(false);
    if (!ok) return setError(data.error ?? "Could not update.");
    router.refresh();
  }

  return (
    <>
      <button type="button" className="btn btn--primary btn--small" disabled={busy} onClick={go}>Mark paid</button>
      {error && <span className="form__error">{error}</span>}
    </>
  );
}
