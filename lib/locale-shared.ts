// Client-safe locale constants — no next/headers import here, so client components
// (like LanguageToggle) can pull this in without dragging server-only code into
// their bundle. Server logic (getLocale, pick) lives in lib/locale.ts.
export type Locale = "en" | "zh";
export const LOCALE_COOKIE = "locale";
