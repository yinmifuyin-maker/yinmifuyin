// Visitor language preference. Stored in a plain (non-httpOnly) cookie so both
// server components (via next/headers) and the client toggle can read/write it.
import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "./locale-shared";

export type { Locale };
export { LOCALE_COOKIE };

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  // Default to Mandarin for first-time visitors (no cookie yet). Once someone
  // has explicitly chosen English via the toggle, that choice always wins.
  return store.get(LOCALE_COOKIE)?.value === "en" ? "en" : "zh";
}

/** Pick the localized value, falling back to English when no Chinese version exists yet. */
export function pick<T>(locale: Locale, en: T, zh: T | undefined | null): T {
  if (locale === "zh" && zh !== undefined && zh !== null) return zh;
  return en;
}
