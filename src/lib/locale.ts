import type { Locale } from "@/lib/types";

export const DEFAULT_LOCALE: Locale = "en";
const KEY = "nawah-locale";

export function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const value = window.localStorage.getItem(KEY);
  return value === "ar" || value === "en" ? value : DEFAULT_LOCALE;
}

export function writeStoredLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, locale);
}
