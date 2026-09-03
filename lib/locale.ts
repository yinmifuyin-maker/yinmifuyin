// Visitor language preference. Stored in a plain (non-httpOnly) cookie so both
// server components (via next/headers) and the client toggle can read/write it.
import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "./locale-shared";

export type { Locale };
export { LOCALE_COOKIE };

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value === "zh" ? "zh" : "en";
}

/** Pick the localized value, falling back to English when no Chinese version exists yet. */
export function pick<T>(locale: Locale, en: T, zh: T | undefined | null): T {
  if (locale === "zh" && zh !== undefined && zh !== null) return zh;
  return en;
}
