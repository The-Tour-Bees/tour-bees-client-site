"use client";

import { useState } from "react";
import { sendJson } from "../../lib/client/post";
import Field, { inputProps } from "../auth/Field";

export default function ChangePasswordForm({ forced }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fe, setFe] = useState({});

  async function submit(e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    setFe({});
    const { ok, data } = await sendJson("/api/auth/change-password", values);
    setBusy(false);
    if (ok) return window.location.assign("/admin");
    setFe(data.fieldErrors ?? {});
    setError(data.error ?? "Something went wrong. Please try again.");
  }

  return (
    <form className="panel admin-password" onSubmit={submit} noValidate>
      <h2>{forced ? "Choose a new password" : "Change password"}</h2>
      {forced && <p className="admin-muted">You are using a temporary password. Choose your own before you continue.</p>}
      <Field id="currentPassword" label={forced ? "Temporary password" : "Current password"} required error={fe.currentPassword}>
        <input {...inputProps("currentPassword", fe.currentPassword)} type="password" autoComplete="current-password" />
      </Field>
      <Field id="newPassword" label="New password" required error={fe.newPassword} hint="At least 8 characters">
        <input {...inputProps("newPassword", fe.newPassword)} type="password" autoComplete="new-password" />
      </Field>
      {error && <div className="form__alert" role="alert">{error}</div>}
      <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : "Save password"}</button>
    </form>
  );
}
