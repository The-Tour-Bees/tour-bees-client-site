"use client";

import { useEffect, useId, useRef, useState } from "react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const pad = (n) => String(n).padStart(2, "0");
const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null;
};
const todayIso = () => {
  const t = new Date();
  return iso(t.getFullYear(), t.getMonth(), t.getDate());
};
const addDays = (s, n) => {
  const p = parse(s);
  const t = new Date(p.y, p.m, p.d + n);
  return iso(t.getFullYear(), t.getMonth(), t.getDate());
};
const friendly = (s) => {
  const p = parse(s);
  return p ? `${p.d} ${MONTHS[p.m].slice(0, 3)} ${p.y}` : "";
};

// Themed date picker. Value is always YYYY-MM-DD ("" when empty).
// Props: name (renders a hidden input for FormData), value + onChange(value) for controlled use,
// defaultValue for uncontrolled, min / max (YYYY-MM-DD, or "today" for min), id, className,
// variant ("field" | "bare"), ariaLabel, placeholder, and aria-* passthrough.
export default function DatePicker({
  name, value, defaultValue = "", onChange, min, max, id, className = "form__input", variant = "field",
  ariaLabel, placeholder = "Select date", ...aria
}) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue || "");
  const current = controlled ? value || "" : inner;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ y: 2026, m: 0 });
  const [focusDay, setFocusDay] = useState("");
  const root = useRef(null);
  const trigger = useRef(null);
  const uid = useId();

  const minD = min === "today" ? (open ? todayIso() : "") : min || "";
  const disabled = (s) => Boolean((minD && s < minD) || (max && s > max));

  const commit = (s) => {
    if (!controlled) setInner(s);
    onChange?.(s);
  };

  const show = () => {
    const base = parse(current) || parse(todayIso());
    setView({ y: base.y, m: base.m });
    setFocusDay(current || todayIso());
    setOpen(true);
  };
  const close = (refocus) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!root.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  // Move DOM focus to the active day when it changes via keyboard.
  useEffect(() => {
    if (open && focusDay) root.current?.querySelector(`[data-day="${focusDay}"]`)?.focus();
  }, [open, focusDay, view]);

  const shiftMonth = (delta) => {
    const t = new Date(view.y, view.m + delta, 1);
    setView({ y: t.getFullYear(), m: t.getMonth() });
    setFocusDay("");
  };

  const moveFocus = (s) => {
    const p = parse(s);
    setView({ y: p.y, m: p.m });
    setFocusDay(s);
  };

  const onGridKey = (e) => {
    const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const cur = e.target.dataset?.day;
    if (!cur) return;
    if (steps[e.key]) {
      e.preventDefault();
      moveFocus(addDays(cur, steps[e.key]));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const pc = parse(cur);
      const dow = (new Date(pc.y, pc.m, pc.d).getDay() + 6) % 7;
      moveFocus(addDays(cur, e.key === "Home" ? -dow : 6 - dow));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const p = parse(cur);
      const t = new Date(p.y, p.m + (e.key === "PageUp" ? -1 : 1), 1);
      const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
      moveFocus(iso(t.getFullYear(), t.getMonth(), Math.min(p.d, last)));
    }
  };

  const onKey = (e) => {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      close(true);
    }
  };

  const pick = (s) => {
    if (disabled(s)) return;
    commit(s);
    close(true);
  };

  // Grid for the visible month, Monday first.
  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push(iso(view.y, view.m, d));
  while (cells.length % 7) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const icon = (
    <svg className="datepicker__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  );

  const today = open ? todayIso() : "";
  // Roving tabindex: the active day if it is in this month, else the first enabled day.
  const tabDay = focusDay && cells.includes(focusDay) ? focusDay : cells.find((s) => s && !disabled(s));
  const titleId = `${uid}-title`;
  const triggerClass = variant === "bare" ? "datepicker__trigger datepicker__trigger--bare" : `datepicker__trigger ${className}`;

  return (
    <div className={`datepicker datepicker--${variant}`} ref={root} onKeyDown={onKey}>
      {name && <input type="hidden" name={name} value={current} />}
      <button
        type="button"
        id={id}
        ref={trigger}
        className={triggerClass}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${uid}-dialog` : undefined}
        aria-label={ariaLabel ? `${ariaLabel}${current ? `: ${friendly(current)}` : ""}` : undefined}
        onClick={() => (open ? close(false) : show())}
        {...aria}
      >
        {variant !== "bare" && icon}
        <span className={current ? "datepicker__value" : "datepicker__value datepicker__value--empty"}>
          {current ? friendly(current) : placeholder}
        </span>
        {variant === "bare" && icon}
      </button>

      {open && (
        <div className="datepicker__pop" role="dialog" aria-modal="false" aria-labelledby={titleId} id={`${uid}-dialog`}>
          <div className="datepicker__head">
            <div className="datepicker__title" id={titleId} aria-live="polite">{MONTHS[view.m]} {view.y}</div>
            <div className="datepicker__navs">
              <button type="button" className="datepicker__nav" aria-label="Previous month" onClick={() => shiftMonth(-1)}>‹</button>
              <button type="button" className="datepicker__nav" aria-label="Next month" onClick={() => shiftMonth(1)}>›</button>
            </div>
          </div>
          <table className="datepicker__grid" role="grid" aria-labelledby={titleId} onKeyDown={onGridKey}>
            <thead>
              <tr>{WEEKDAYS.map((w) => <th key={w} scope="col" className="datepicker__dow">{w}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((s, ci) => (
                    <td key={ci} role="gridcell" aria-selected={s ? s === current : undefined}>
                      {s && (
                        <button
                          type="button"
                          data-day={s}
                          tabIndex={s === tabDay ? 0 : -1}
                          disabled={disabled(s)}
                          aria-label={`${parse(s).d} ${MONTHS[view.m]} ${view.y}`}
                          aria-current={s === today ? "date" : undefined}
                          className={
                            "datepicker__day" +
                            (s === current ? " datepicker__day--on" : "") +
                            (s === today ? " datepicker__day--today" : "")
                          }
                          onClick={() => pick(s)}
                        >
                          {parse(s).d}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="datepicker__foot">
            <button type="button" className="datepicker__clear" onClick={() => { commit(""); close(true); }}>Clear</button>
            <button type="button" className="datepicker__today" disabled={disabled(todayIso())} onClick={() => pick(todayIso())}>Today</button>
          </div>
        </div>
      )}
    </div>
  );
}
