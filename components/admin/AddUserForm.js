"use client";

import Link from "next/link";
import { useState } from "react";
import { sendJson } from "../../lib/client/post";
import Field, { inputProps } from "../auth/Field";

const TYPES = [["host", "Host"], ["agent", "Agent"], ["member", "Member"]];
const BLOOD = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function AddUserForm() {
  const [type, setType] = useState("host");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fe, setFe] = useState({});
  const [created, setCreated] = useState(null);
  const [formKey, setFormKey] = useState(0);

  async function submit(e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    setFe({});

    const { ok, data } = await sendJson("/api/admin/users", { ...values, accountType: type });
    setBusy(false);
    if (!ok) {
      setFe(data.fieldErrors ?? {});
      return setError(data.error ?? "Something went wrong. Please try again.");
    }
    setCreated(data);
  }

  if (created) {
    return (
      <div className="panel admin-done" role="status">
        <h2>User created</h2>
        <p>
          {created.user.fullName} ({created.user.username}) is waiting for your approval. They can sign in after you approve them.
        </p>
        <p className="admin-done__label">Temporary password</p>
        <p className="admin-done__password">{created.temporaryPassword}</p>
        <p className="admin-muted">
          {created.delivered ? "We also sent it to their mobile. " : "We could not send it by message, so give it to them yourself. "}
          This is the only time it is shown. They must choose a new password when they first sign in.
        </p>
        <div className="admin-actions">
          <Link href="/admin/users?approval=pending" className="btn btn--primary">Review approvals</Link>
          <button type="button" className="btn btn--ghost" onClick={() => { setCreated(null); setFormKey((k) => k + 1); }}>Add another</button>
        </div>
      </div>
    );
  }

  return (
    <form key={formKey} className="admin-form" onSubmit={submit} noValidate>
      <fieldset className="panel admin-fieldset">
        <legend>Account</legend>
        <div className="form__field form__field--full">
          <span className="form__label">Account type <span aria-hidden="true">*</span></span>
          <div className="tabs-nav" role="radiogroup" aria-label="Account type">
            {TYPES.map(([value, label]) => (
              <button key={value} type="button" role="radio" aria-checked={type === value} className={type === value ? "tabs-nav__link tabs-nav__link--on" : "tabs-nav__link"} onClick={() => setType(value)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <Field id="fullName" label="Full name" required error={fe.fullName}><input {...inputProps("fullName", fe.fullName)} type="text" autoComplete="off" /></Field>
        <Field id="username" label="Username (unique)" required error={fe.username}><input {...inputProps("username", fe.username)} type="text" autoComplete="off" /></Field>
        <Field id="email" label="Email address (unique)" required error={fe.email}><input {...inputProps("email", fe.email)} type="email" autoComplete="off" /></Field>
        <Field id="mobile" label="Mobile / WhatsApp (unique)" required error={fe.mobile}><input {...inputProps("mobile", fe.mobile)} type="tel" placeholder="+8801XXXXXXXXX" autoComplete="off" /></Field>
        <Field id="status" label="Status" error={fe.status}>
          <select {...inputProps("status", fe.status)} defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></select>
        </Field>
        <p className="admin-muted form__field--full">A temporary password is created for you when you save. Profile photos will be added later.</p>
      </fieldset>

      <fieldset className="panel admin-fieldset">
        <legend>Personal details</legend>
        <Field id="bloodGroup" label="Blood group" error={fe.bloodGroup}>
          <select {...inputProps("bloodGroup", fe.bloodGroup)} defaultValue="">{BLOOD.map((b) => <option key={b} value={b}>{b || "Not given"}</option>)}</select>
        </Field>
        <Field id="dateOfBirth" label="Date of birth" error={fe.dateOfBirth}><input {...inputProps("dateOfBirth", fe.dateOfBirth)} type="date" /></Field>
        <Field id="nidNumber" label="NID number" error={fe.nidNumber}><input {...inputProps("nidNumber", fe.nidNumber)} type="text" autoComplete="off" /></Field>
        <Field id="emergencyContact" label="Emergency contact" error={fe.emergencyContact}><input {...inputProps("emergencyContact", fe.emergencyContact)} type="tel" autoComplete="off" /></Field>
        <Field id="presentAddress" label="Present address" full error={fe.presentAddress}><textarea {...inputProps("presentAddress", fe.presentAddress)} rows={3} /></Field>
      </fieldset>

      {type === "agent" && (
        <fieldset className="panel admin-fieldset admin-fieldset--role">
          <legend>Agent details</legend>
          <Field id="commissionPercent" label="Commission %" required error={fe.commissionPercent}><input {...inputProps("commissionPercent", fe.commissionPercent)} type="number" min="0" max="100" step="0.5" /></Field>
          <Field id="payoutNumber" label="bKash / Nagad number" error={fe.payoutNumber}><input {...inputProps("payoutNumber", fe.payoutNumber)} type="tel" autoComplete="off" /></Field>
        </fieldset>
      )}

      {type === "member" && (
        <fieldset className="panel admin-fieldset admin-fieldset--role">
          <legend>Member details</legend>
          <Field id="tier" label="Member tier" error={fe.tier}>
            <select {...inputProps("tier", fe.tier)} defaultValue="regular"><option value="regular">Regular</option><option value="vip">VIP</option></select>
          </Field>
          <Field id="expiresAt" label="Membership expiry" error={fe.expiresAt}><input {...inputProps("expiresAt", fe.expiresAt)} type="date" /></Field>
        </fieldset>
      )}

      {error && <div className="form__alert" role="alert">{error}</div>}
      <div className="admin-actions">
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : "Create user"}</button>
        <Link href="/admin/users" className="btn btn--ghost">Cancel</Link>
        <p className="admin-muted">The new user cannot sign in until you approve them.</p>
      </div>
    </form>
  );
}
