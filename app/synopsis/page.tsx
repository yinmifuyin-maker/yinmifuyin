import type { Metadata } from "next";
import { getSeries } from "@/lib/content";
import PortableProse from "@/components/PortableProse";
import HoverReveal from "@/components/HoverReveal";
import TranslateHint from "@/components/TranslateHint";

export const metadata: Metadata = {
  title: "Synopsis · The Hidden Gospel",
};

export default async function SynopsisPage() {
  const series = await getSeries();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-serif-display)] text-4xl">Synopsis</h1>
      <p className="mt-2 text-sm opacity-70">{series?.titleZh} · {series?.title}</p>

      <div className="mt-10">
        {series?.synopsisZh && series?.synopsisEn ? (
          <>
            <TranslateHint className="mb-4" />
            <HoverReveal
              base={<PortableProse value={series.synopsisZh} />}
              reveal={<PortableProse value={series.synopsisEn} />}
            />
          </>
        ) : series?.synopsisZh ? (
          <PortableProse value={series.synopsisZh} />
        ) : series?.synopsisEn ? (
          <PortableProse value={series.synopsisEn} />
        ) : (
          <p className="text-base leading-relaxed opacity-90">Coming soon.</p>
        )}
      </div>
    </div>
  );
}
