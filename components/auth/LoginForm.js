"use client";

import Link from "next/link";
import { useState } from "react";
import { sendJson } from "../../lib/client/post";
import Field, { inputProps } from "./Field";

export default function LoginForm() {
  const [step, setStep] = useState("credentials"); // credentials | otp
  const [sentTo, setSentTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null); // { tone, text }
  const [fieldErrors, setFieldErrors] = useState({});

  const done = (next) => window.location.assign(next);

  async function submit(e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    setNotice(null);
    setFieldErrors({});

    const { ok, data } = await sendJson(step === "otp" ? "/api/auth/verify-otp" : "/api/auth/login", values);
    setBusy(false);

    if (ok && data.step === "otp") {
      setSentTo(data.sentTo);
      setStep("otp");
      return;
    }
    if (ok) return done(data.next ?? "/admin");

    if (data.code === "pending") setNotice({ tone: "wait", text: data.error });
    else if (data.code === "restart") {
      setStep("credentials");
      setError(data.error);
    } else {
      setFieldErrors(data.fieldErrors ?? {});
      setError(data.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {step === "credentials" ? (
        <>
          <Field id="identifier" label="Mobile or email" error={fieldErrors.identifier}>
            <input {...inputProps("identifier", fieldErrors.identifier)} type="text" autoComplete="username" required />
          </Field>
          <Field id="password" label="Password" error={fieldErrors.password}>
            <input {...inputProps("password", fieldErrors.password)} type="password" autoComplete="current-password" required />
          </Field>
          <Link href="/forgot-password" className="auth-form__link">Forgot password?</Link>
        </>
      ) : (
        <>
          <p className="auth-form__lead">We sent a 6-digit code to {sentTo}. It expires in 5 minutes.</p>
          <Field id="code" label="One-time code" error={fieldErrors.code}>
            <input {...inputProps("code", fieldErrors.code)} className="form__input form__input--code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus />
          </Field>
          <button type="button" className="auth-form__link auth-form__link--button" onClick={() => { setStep("credentials"); setError(""); }}>
            Use a different account
          </button>
        </>
      )}

      {notice && <div className="form__alert form__alert--wait" role="status">{notice.text} We will let you know once it is approved.</div>}
      {error && <div className="form__alert" role="alert">{error}</div>}

      <button type="submit" className="btn btn--primary" disabled={busy}>
        {busy ? "Please wait…" : step === "otp" ? "Verify and sign in" : "Sign in"}
      </button>
    </form>
  );
}
