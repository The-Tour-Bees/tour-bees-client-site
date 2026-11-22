"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "../../lib/client/post";

export default function UserActions({ id, approvalStatus, status, isSelf }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function act(action) {
    setBusy(true);
    setError("");
    const { ok, data } = await sendJson(`/api/admin/users/${id}`, { action }, "PATCH");
    setBusy(false);
    if (!ok) return setError(data.error ?? "Could not update.");
    router.refresh();
  }

  if (isSelf) return <span className="admin-muted">You</span>;

  return (
    <div className="admin-actions">
      {approvalStatus === "pending" && (
        <>
          <button type="button" className="btn btn--primary btn--small" disabled={busy} onClick={() => act("approve")}>Approve</button>
          <button type="button" className="btn btn--ghost btn--small" disabled={busy} onClick={() => act("reject")}>Reject</button>
        </>
      )}
      {approvalStatus === "approved" && status === "active" && (
        <button type="button" className="btn btn--ghost btn--small" disabled={busy} onClick={() => act("deactivate")}>Deactivate</button>
      )}
      {approvalStatus === "approved" && status === "inactive" && (
        <button type="button" className="btn btn--ghost btn--small" disabled={busy} onClick={() => act("activate")}>Activate</button>
      )}
      {approvalStatus === "rejected" && (
        <button type="button" className="btn btn--ghost btn--small" disabled={busy} onClick={() => act("approve")}>Approve</button>
      )}
      {error && <span className="form__error">{error}</span>}
    </div>
  );
}
