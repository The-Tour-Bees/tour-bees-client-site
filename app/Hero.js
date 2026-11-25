"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DatePicker from "../components/DatePicker";
import SiteHeader from "../components/SiteHeader";

const TABS = ["Stays", "Tours", "Activities"];
const POPULAR = ["Lisbon", "Kyoto", "Banff", "Cape Town", "Bali"];
const OVERLAY = 1;

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function Hero() {
  const [tab, setTab] = useState("Stays");
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("2026-12-05");
  const [checkOut, setCheckOut] = useState("2026-12-14");
  const [guests, setGuests] = useState({ adults: 2, children: 1, rooms: 1 });
  const [guestsOpen, setGuestsOpen] = useState(false);
  const router = useRouter();

  const change = (key, delta, min) =>
    setGuests((g) => ({ ...g, [key]: Math.min(12, Math.max(min, g[key] + delta)) }));

  const steppers = [
    { key: "adults", label: "Adults", hint: "Ages 13+", min: 1 },
    { key: "children", label: "Children", hint: "Ages 0–12", min: 0 },
    { key: "rooms", label: "Rooms", hint: "Separate rooms", min: 1 },
  ];

  // Stays go to /hotels with the dates and guests; Tours and Activities search by place.
  const search = () => {
    setGuestsOpen(false);
    const q = location.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);

    if (tab === "Stays") {
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
      params.set("adults", guests.adults);
      params.set("children", guests.children);
      params.set("rooms", guests.rooms);
    }

    const path = tab === "Stays" ? "/hotels" : tab === "Tours" ? "/custom-trip" : "/events/upcoming";
    const qs = params.toString();
    router.push(qs ? `${path}?${qs}` : path);
  };

  const guestsLabel = `${plural(guests.adults, "adult")} · ${guests.children} ${
    guests.children === 1 ? "child" : "children"
  } · ${plural(guests.rooms, "room")}`;

  const scrim = `linear-gradient(180deg, rgba(16,16,18,${(OVERLAY * 0.9).toFixed(2)}) 0%, rgba(16,16,18,${(
    OVERLAY * 0.5
  ).toFixed(2)}) 45%, rgba(16,16,18,${Math.min(1, OVERLAY * 1.3).toFixed(2)}) 100%)`;

  return (
    <section className="hero">
      <div className="hero__bg" style={{ backgroundImage: "url(/hero-bg.png)" }} />
      <div className="hero__scrim" style={{ background: scrim }} />

      <SiteHeader overlay />

      <div className="hero__content">
        <span className="badge">
          <span className="badge__dot" />
          2,400+ hand-picked stays and tours
        </span>
        <h1>
          The World is Waiting <span className="serif">For You</span>
        </h1>
        <p className="lede">Discover amazing places at exclusive deals</p>

        <div className="search-wrap">
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                className={tab === t ? "tab tab--on" : "tab"}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="search">
            <label className="field field--loc">
              <span className="field__label">Location</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Where are you going?"
              />
            </label>
            <div className="divider" />
            <div className="field field--dates">
              <span className="field__label">Check in – Check out</span>
              <div className="dates">
                <DatePicker
                  variant="bare"
                  ariaLabel="Check in"
                  value={checkIn}
                  min="today"
                  onChange={(v) => {
                    setCheckIn(v);
                    if (v && checkOut && checkOut < v) setCheckOut(v);
                  }}
                />
                <span className="dates__arrow">→</span>
                <DatePicker
                  variant="bare"
                  ariaLabel="Check out"
                  value={checkOut}
                  min={checkIn || "today"}
                  onChange={setCheckOut}
                />
              </div>
            </div>
            <div className="divider" />
            <div className="guests">
              <button
                type="button"
                className="field guests__btn"
                aria-expanded={guestsOpen}
                onClick={() => setGuestsOpen((o) => !o)}
              >
                <span className="field__label">Guests</span>
                <span className="guests__value">{guestsLabel}</span>
              </button>
              {guestsOpen && (
                <div className="popover">
                  {steppers.map((s, i) => (
                    <div
                      key={s.key}
                      className="stepper"
                      style={{ borderBottom: i === steppers.length - 1 ? 0 : undefined }}
                    >
                      <div className="stepper__text">
                        <span className="stepper__label">{s.label}</span>
                        <span className="stepper__hint">{s.hint}</span>
                      </div>
                      <div className="stepper__ctl">
                        <button
                          type="button"
                          aria-label={`Fewer ${s.label.toLowerCase()}`}
                          onClick={() => change(s.key, -1, s.min)}
                        >
                          −
                        </button>
                        <span className="stepper__val">{guests[s.key]}</span>
                        <button
                          type="button"
                          aria-label={`More ${s.label.toLowerCase()}`}
                          onClick={() => change(s.key, 1, s.min)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="search__go" onClick={search}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              Search
            </button>
          </div>

          <div className="popular">
            <span className="popular__label">Popular:</span>
            {POPULAR.map((name) => (
              <button
                key={name}
                type="button"
                className="chip"
                onClick={() => {
                  setLocation(name);
                  setGuestsOpen(false);
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
