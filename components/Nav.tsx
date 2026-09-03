"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/locale";
import DonateButton from "./DonateButton";
import LanguageToggle from "./LanguageToggle";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story" },
  { href: "/synopsis", label: "Synopsis" },
  { href: "/characters", label: "Characters" },
  { href: "/episodes", label: "Episodes" },
  { href: "/artists", label: "Artists" },
  { href: "/team", label: "Team" },
  { href: "/support", label: "Support" },
];

export default function Nav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="hairline border-b bg-parchment/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-[family-name:var(--font-calligraphy)] text-2xl">
          隐秘福音
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-1 text-sm tracking-wide ${
                isActive(tab.href) ? "hand-underline font-medium" : "opacity-80 hover:opacity-100"
              }`}
              aria-current={isActive(tab.href) ? "page" : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LanguageToggle locale={locale} />
          <DonateButton />
        </div>

        <button
          type="button"
          className="hairline rounded border px-3 py-2 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Primary" className="hairline border-t px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {TABS.map((tab) => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  onClick={() => setOpen(false)}
                  className={`text-sm tracking-wide ${
                    isActive(tab.href) ? "hand-underline font-medium" : "opacity-80"
                  }`}
                  aria-current={isActive(tab.href) ? "page" : undefined}
                >
                  {tab.label}
                </Link>
              </li>
            ))}
            <li>
              <LanguageToggle locale={locale} />
            </li>
            <li>
              <DonateButton />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
