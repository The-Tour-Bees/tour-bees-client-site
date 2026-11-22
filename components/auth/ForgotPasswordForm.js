"use client";

import Link from "next/link";
import { useState } from "react";
import { sendJson } from "../../lib/client/post";
import Field, { inputProps } from "./Field";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState("ask"); // ask | reset | done
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function submit(e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    setFieldErrors({});

    const isAsk = step === "ask";
    const { ok, data } = await sendJson(isAsk ? "/api/auth/forgot-password" : "/api/auth/reset-password", isAsk ? values : { ...values, identifier });
    setBusy(false);

    if (!ok) {
      setFieldErrors(data.fieldErrors ?? {});
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    if (isAsk) setIdentifier(values.identifier);
    setStep(isAsk ? "reset" : "done");
  }

  if (step === "done") {
    return (
      <div className="auth-form">
        <p className="auth-form__lead">Your password has been changed. You can sign in with it now.</p>
        <Link href="/login" className="btn btn--primary">Go to sign in</Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {step === "ask" ? (
        <>
          <p className="auth-form__lead">Enter your mobile or email. If there is an account, we will send a code.</p>
          <Field id="identifier" label="Mobile or email" error={fieldErrors.identifier}>
            <input {...inputProps("identifier", fieldErrors.identifier)} type="text" autoComplete="username" required />
          </Field>
        </>
      ) : (
        <>
          <p className="auth-form__lead">If an account exists for {identifier}, we sent it a 6-digit code.</p>
          <Field id="code" label="One-time code" error={fieldErrors.code}>
            <input {...inputProps("code", fieldErrors.code)} className="form__input form__input--code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required />
          </Field>
          <Field id="newPassword" label="New password" error={fieldErrors.newPassword} hint="At least 8 characters">
            <input {...inputProps("newPassword", fieldErrors.newPassword)} type="password" autoComplete="new-password" required />
          </Field>
        </>
      )}

      {error && <div className="form__alert" role="alert">{error}</div>}
      <button type="submit" className="btn btn--primary" disabled={busy}>
        {busy ? "Please wait…" : step === "ask" ? "Send code" : "Change password"}
      </button>
      <Link href="/login" className="auth-form__link">Back to sign in</Link>
    </form>
  );
}
