"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_CURRENCY, isCurrency, normalizeRates } from "../lib/currency";

const STORAGE_KEY = "tourbees-currency";

const CurrencyContext = createContext({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  rates: normalizeRates(),
  refreshRates: async () => {},
});

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);
  // Starts on the default rates, so the server render and the first client render match.
  const [rates, setRates] = useState(() => normalizeRates());

  // Keeps the rates already in use if the request fails.
  const refreshRates = useCallback(async () => {
    try {
      const res = await fetch("/api/currency-rates", { cache: "no-store" });
      if (res.ok) setRates(normalizeRates(await res.json()));
    } catch {}
  }, []);

  useEffect(() => {
    refreshRates();
  }, [refreshRates]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && isCurrency(saved)) setCurrencyState(saved);
    } catch {}
  }, []);

  const setCurrency = (code) => {
    if (!isCurrency(code)) return;
    setCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, refreshRates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
