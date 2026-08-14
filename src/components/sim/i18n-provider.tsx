"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, type Lang, type Translation } from "@/lib/translations";

interface I18nContextValue {
  lang: Lang;
  t: Translation;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("ic-lang");
  if (stored === "en" || stored === "fa") return stored;
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Use lazy initializer — runs only once, on the client, no effect needed
  // On SSR returns "en", on client first render returns stored value
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  // Sync <html> attributes and localStorage whenever lang changes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    localStorage.setItem("ic-lang", lang);
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggleLang = () => setLangState((prev) => (prev === "en" ? "fa" : "en"));

  const value: I18nContextValue = {
    lang,
    t: translations[lang],
    setLang,
    toggleLang,
    isRtl: lang === "fa",
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      lang: "en",
      t: translations.en,
      setLang: () => {},
      toggleLang: () => {},
      isRtl: false,
    };
  }
  return ctx;
}
