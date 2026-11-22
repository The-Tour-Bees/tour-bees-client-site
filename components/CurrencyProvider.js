"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_CURRENCY, isCurrency } from "../lib/currency";

const STORAGE_KEY = "tourbees-currency";

const CurrencyContext = createContext({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
});

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);

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
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
