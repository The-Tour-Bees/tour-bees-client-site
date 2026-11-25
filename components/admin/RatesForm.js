"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "../../lib/client/post";
import { BASE_CURRENCY, CURRENCIES, RATE_CODES, formatPrice, isRate } from "../../lib/currency";
import Field, { inputProps } from "../auth/Field";
import { useCurrency } from "../CurrencyProvider";

const SAMPLE_BDT = 21000;

const label = (code) => `${code} · ${CURRENCIES[code].name}`;

// rates: { USD, EUR, INR } as saved. updatedAt: formatted date and time, or null.
export default function RatesForm({ rates, updatedAt }) {
  const router = useRouter();
  const { refreshRates } = useCurrency();
  const [values, setValues] = useState(() => Object.fromEntries(RATE_CODES.map((code) => [code, String(rates[code])])));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [fe, setFe] = useState({});

  const draft = Object.fromEntries(RATE_CODES.map((code) => [code, Number(values[code])]));

  function change(code, value) {
    setValues((v) => ({ ...v, [code]: value }));
    setFe((f) => ({ ...f, [code]: undefined }));
    setSaved(false);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    const invalid = Object.fromEntries(RATE_CODES.filter((code) => !isRate(draft[code])).map((code) => [code, "Enter a number greater than 0"]));
    setFe(invalid);
    if (Object.keys(invalid).length) return setError("Please check the highlighted fields.");

    setBusy(true);
    const { ok, data } = await sendJson("/api/admin/currency-rates", { rates: draft }, "PUT");
    setBusy(false);
    if (!ok) return setError(data.fieldErrors?.rates ?? data.error ?? "Something went wrong. Please try again.");
    setSaved(true);
    refreshRates(); // so prices elsewhere on the site update without a reload
    router.refresh();
  }

  return (
    <form className="panel rates" onSubmit={submit} noValidate>
      <h2>Currency rates</h2>
      <p className="admin-muted">Prices are stored in BDT. Each rate is how many BDT one unit of that currency is worth.</p>
      <Field id={BASE_CURRENCY} label={label(BASE_CURRENCY)} hint="Base currency, always 1">
        <input {...inputProps(BASE_CURRENCY)} type="number" value="1" disabled readOnly />
      </Field>
      {RATE_CODES.map((code) => (
        <Field key={code} id={code} label={label(code)} required error={fe[code]} hint={`BDT per 1 ${code}`}>
          <input {...inputProps(code, fe[code])} type="number" min="0" step="any" inputMode="decimal" value={values[code]} onChange={(e) => change(code, e.target.value)} />
        </Field>
      ))}
      <p className="rates__preview" aria-live="polite">
        Preview: a {formatPrice(SAMPLE_BDT, BASE_CURRENCY)} price shows as{" "}
        {[BASE_CURRENCY, ...RATE_CODES]
          .map((code) => `${code} ${code === BASE_CURRENCY || isRate(draft[code]) ? formatPrice(SAMPLE_BDT, code, draft) : "–"}`)
          .join(" · ")}
      </p>
      {error && <div className="form__alert" role="alert">{error}</div>}
      <div className="rates__actions">
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
        {saved && <span role="status">Rates saved.</span>}
      </div>
      <p className="admin-muted">{updatedAt ? `Last updated ${updatedAt} (Bangladesh time)` : "Not saved yet"}</p>
    </form>
  );
}
