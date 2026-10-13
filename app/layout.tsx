import type { Metadata } from "next";
import { Ma_Shan_Zheng, Cormorant_Garamond, Mulish, Noto_Serif_SC } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getLocale } from "@/lib/locale";
import { getSeries } from "@/lib/content";
import "./globals.css";

const maShanZheng = Ma_Shan_Zheng({
  variable: "--font-ma-shan-zheng",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Display and body faces from the collaborator brief.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  display: "swap",
});

// Paired with Cormorant for reading text (see --font-serif-display in globals.css):
// Cormorant has no CJK glyphs, so Chinese characters fall through to this font
// rather than an undesigned OS default.
const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  weight: ["400", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "隐秘福音 · The Hidden Gospel",
  description:
    "Yǐnmì Fúyīn · A Tang Dynasty Manhua & Artist Hub — the story, characters, episodes, and artists of The Hidden Gospel.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [locale, series] = await Promise.all([getLocale(), getSeries()]);

  return (
    <html
      lang={locale}
      className={`${maShanZheng.variable} ${cormorant.variable} ${mulish.variable} ${notoSerifSC.variable}`}
    >
      <body className="flex min-h-full flex-col bg-parchment font-sans text-ink">
        <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-2.5 border-b-2 border-gold bg-ink sm:h-3" />
        <div aria-hidden className="fixed inset-x-0 bottom-0 z-50 h-2.5 border-t-2 border-gold bg-ink sm:h-3" />

        <div className="flex min-h-full flex-1 flex-col pt-2.5 pb-2.5 sm:pt-3 sm:pb-3">
          <Nav locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer series={series} locale={locale} />
        </div>
      </body>
    </html>
  );
}
