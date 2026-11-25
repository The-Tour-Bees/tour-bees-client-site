"use client";

import { useEffect, useId, useRef, useState } from "react";

// Themed dropdown. options: [{ value, label }]. Renders a hidden input named `name`, so it
// submits in plain GET/POST forms. Controlled (value + onChange) or uncontrolled (defaultValue).
export default function Select({
  name, options, value, defaultValue, onChange, id, className = "form__input", ariaLabel, ...aria
}) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue ?? options[0]?.value ?? "");
  const current = String(controlled ? value : inner);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const trigger = useRef(null);
  const uid = useId();

  const selectedIndex = Math.max(0, options.findIndex((o) => String(o.value) === current));
  const selected = options[selectedIndex];

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

  useEffect(() => {
    if (open) root.current?.querySelector(`#${CSS.escape(`${uid}-o${active}`)}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, uid]);

  const show = () => {
    setActive(selectedIndex);
    setOpen(true);
  };
  const choose = (i) => {
    const v = String(options[i].value);
    if (!controlled) setInner(v);
    onChange?.(v);
    setOpen(false);
    trigger.current?.focus();
  };

  const onKey = (e) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return show();
      const d = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => Math.min(options.length - 1, Math.max(0, a + d)));
    } else if (e.key === "Home" && open) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End" && open) {
      e.preventDefault();
      setActive(options.length - 1);
    } else if ((e.key === "Enter" || e.key === " ") && open) {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Tab" && open) {
      setOpen(false);
    }
  };

  return (
    <div className="select" ref={root}>
      {name && <input type="hidden" name={name} value={current} />}
      <button
        type="button"
        id={id}
        ref={trigger}
        className={`select__btn ${className}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-label={ariaLabel ? `${ariaLabel}: ${selected?.label ?? ""}` : undefined}
        aria-activedescendant={open ? `${uid}-o${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKey}
        {...aria}
      >
        <span className="select__value">{selected?.label}</span>
        <svg className="select__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="select__list" role="listbox" id={`${uid}-list`} aria-label={ariaLabel}>
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${uid}-o${i}`}
              role="option"
              aria-selected={i === selectedIndex}
              className={"select__opt" + (i === selectedIndex ? " select__opt--on" : "") + (i === active ? " select__opt--active" : "")}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
            >
              <span>{o.label}</span>
              {i === selectedIndex && (
                <svg className="select__check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
