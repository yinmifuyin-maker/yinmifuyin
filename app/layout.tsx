import type { Metadata } from "next";
import { Ma_Shan_Zheng, Fraunces, Inter } from "next/font/google";
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

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
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
      className={`${maShanZheng.variable} ${fraunces.variable} ${inter.variable}`}
    >
      <body className="flex min-h-full flex-col bg-parchment font-sans text-ink">
        <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-2.5 bg-ink sm:h-3" />
        <div aria-hidden className="fixed inset-x-0 bottom-0 z-50 h-2.5 bg-ink sm:h-3" />

        <div className="flex min-h-full flex-1 flex-col pt-2.5 pb-2.5 sm:pt-3 sm:pb-3">
          <Nav locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer series={series} locale={locale} />
        </div>
      </body>
    </html>
  );
}
