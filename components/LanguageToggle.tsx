"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/locale-shared";

export default function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();

  function setLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-sm tracking-wide" role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={locale === "en" ? "font-medium hand-underline" : "opacity-60 hover:opacity-100"}
      >
        EN
      </button>
      <span aria-hidden className="opacity-40">
        /
      </span>
      <button
        type="button"
        onClick={() => setLocale("zh")}
        aria-pressed={locale === "zh"}
        className={locale === "zh" ? "font-medium hand-underline" : "opacity-60 hover:opacity-100"}
      >
        中文
      </button>
    </div>
  );
}
