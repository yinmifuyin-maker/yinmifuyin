import Image from "next/image";
import type { Locale } from "@/lib/locale";
import { pick } from "@/lib/locale";
import type { Series } from "@/lib/content";
import DonateButton from "./DonateButton";
import PortableProse from "./PortableProse";

export default function Footer({ series, locale }: { series: Series | undefined; locale: Locale }) {
  return (
    <footer className="hairline mt-16 border-t px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <p className="font-[family-name:var(--font-calligraphy)] text-xl">隐秘福音</p>
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
            className="opacity-80"
          />
          <p className="text-[11px] uppercase tracking-widest opacity-50">Follow us</p>
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

        <p className="text-xs opacity-60">
          © {new Date().getFullYear()} The Hidden Gospel · Yǐnmì Fúyīn. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
