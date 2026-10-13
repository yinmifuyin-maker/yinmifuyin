import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { pick } from "@/lib/locale";
import type { Series } from "@/lib/content";
import DonateButton from "./DonateButton";
import PortableProse from "./PortableProse";

export default function Footer({ series, locale }: { series: Series | undefined; locale: Locale }) {
  return (
    <footer className="relative z-20 mt-16 border-t-4 border-double border-gold bg-ink px-6 py-10 text-parchment">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <p className="font-[family-name:var(--font-calligraphy)] text-2xl text-gold">隐秘福音</p>
        <div aria-hidden className="gold-rule" />
        {series?.openingQuote && (
          <PortableProse
            value={pick(locale, series.openingQuote, undefined)}
            className="max-w-md text-sm opacity-80"
          />
        )}
        <DonateButton />

        <div className="mt-2 flex flex-col items-center gap-1">
          <Image
            src="/images/instagram-qr.png"
            alt="Instagram QR code for @yinmifuyin_"
            width={64}
            height={64}
            className="rounded-sm bg-parchment p-1"
          />
          <p className="text-[11px] uppercase tracking-widest text-gold-soft">Follow us</p>
        </div>

        <p className="text-xs opacity-70">
          Questions?{" "}
          <a
            href="mailto:yinmifuyin@gmail.com"
            className="underline underline-offset-2 opacity-90 hover:opacity-100"
          >
            yinmifuyin@gmail.com
          </a>
        </p>

        <p className="text-xs opacity-70">
          <Link
            href="/use-of-proceeds"
            className="underline underline-offset-2 opacity-90 hover:opacity-100"
          >
            See how donations are used
          </Link>
        </p>

        <p className="text-xs opacity-60">
          © {new Date().getFullYear()} The Hidden Gospel · Yǐnmì Fúyīn. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
