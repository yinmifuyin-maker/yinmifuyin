import type { Metadata } from "next";
import { getSeries } from "@/lib/content";
import PortableProse from "@/components/PortableProse";

export const metadata: Metadata = {
  title: "Synopsis · The Hidden Gospel",
};

export default async function SynopsisPage() {
  const series = await getSeries();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-serif-display)] text-4xl">Synopsis</h1>
      <p className="mt-2 text-sm opacity-70">{series?.titleZh} · {series?.title}</p>

      <div className="mt-10 space-y-4">
        <h2 className="text-sm uppercase tracking-widest opacity-60">English</h2>
        {series?.synopsisEn ? (
          <PortableProse value={series.synopsisEn} />
        ) : (
          <p className="text-base leading-relaxed opacity-90">Coming soon.</p>
        )}
      </div>

      <div className="hairline my-12 border-t" />

      <div className="space-y-4">
        <h2 className="text-sm uppercase tracking-widest opacity-60">中文</h2>
        {series?.synopsisZh ? (
          <PortableProse value={series.synopsisZh} />
        ) : (
          <p className="text-base leading-relaxed opacity-90">Coming soon.</p>
        )}
      </div>
    </div>
  );
}
