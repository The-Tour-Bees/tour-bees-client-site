"use client";

import { useState } from "react";

// hidden: extra values sent with the form, e.g. { eventSlug }
// defaults: initial values by field name, e.g. from the search the visitor just made
// fields: [{ name, label, type: "text" | "email" | "tel" | "textarea" | "select", required, options, placeholder, full }]
export default function EnquiryForm({
  type,
  fields,
  hidden,
  defaults,
  submitLabel = "Send enquiry",
  successTitle = "Thank you!",
  successText = "We have received your message and will get back to you soon.",
  note,
}) {
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    setError("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...hidden, ...data }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        form.reset();
        setStatus("success");
        return;
      }
      if (body.fieldErrors) setFieldErrors(body.fieldErrors);
      setError(body.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    }
    setStatus("error");
  }

  if (status === "success") {
    return (
      <div className="form-success" role="status">
        <h3>{successTitle}</h3>
        <p>{successText}</p>
        <button type="button" className="btn btn--ghost" onClick={() => setStatus("idle")}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {fields.map((f) => {
        const id = `${type}-${f.name}`;
        const err = fieldErrors[f.name];
        const common = {
          id,
          name: f.name,
          className: "form__input",
          required: f.required,
          placeholder: f.placeholder,
          "aria-invalid": err ? true : undefined,
          "aria-describedby": err ? `${id}-error` : undefined,
        };

        return (
          <div key={f.name} className={f.full ? "form__field form__field--full" : "form__field"}>
            <label className="form__label" htmlFor={id}>
              {f.label}
              {f.required && <span aria-hidden="true"> *</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea {...common} rows={5} />
            ) : f.type === "select" ? (
              <select {...common} defaultValue={defaults?.[f.name] ?? f.options[0]}>
                {f.options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input {...common} type={f.type ?? "text"} autoComplete={f.autoComplete} defaultValue={defaults?.[f.name]} />
            )}
            {err && <span id={`${id}-error`} className="form__error">{err}</span>}
          </div>
        );
      })}

      {/* Honeypot for bots; hidden from people and screen readers. */}
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" && <div className="form__alert" role="alert">{error}</div>}

      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : submitLabel}
        </button>
        {note && <p className="form__note">{note}</p>}
      </div>
    </form>
  );
}
