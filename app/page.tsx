import Link from "next/link";
import { getSeries, getConceptArtPool, getFeaturedStoryboard } from "@/lib/content";
import { getLocale, pick } from "@/lib/locale";
import PortableProse from "@/components/PortableProse";
import HomeBackgroundArt from "@/components/HomeBackgroundArt";
import HeroTitle from "@/components/HeroTitle";
import GatedVideo from "@/components/GatedVideo";

export default async function Home() {
  const [series, pool, locale, storyboard] = await Promise.all([
    getSeries(),
    getConceptArtPool(),
    getLocale(),
    getFeaturedStoryboard(),
  ]);

  const synopsis = series ? pick(locale, series.synopsisEn, series.synopsisZh) : undefined;

  return (
    <div className="relative">
      <HomeBackgroundArt images={pool} />

      <section className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center sm:py-28">
        <HeroTitle titleZh={series?.titleZh} title={series?.title} />
        <p className="text-sm tracking-wide opacity-70">
          Yǐnmì Fúyīn · {series?.tagline}
        </p>
        {series?.openingQuote && (
          <PortableProse value={series.openingQuote} className="max-w-md text-sm opacity-70" />
        )}
      </section>

      <div className="hairline relative mx-auto max-w-3xl border-t" />

      <section className="relative mx-auto max-w-3xl px-6 py-16">
        {synopsis ? (
          <PortableProse value={synopsis} className="text-center" />
        ) : (
          <p className="text-center text-base leading-relaxed opacity-90 sm:text-lg">
            Coming soon.
          </p>
        )}
      </section>

      {storyboard && (
        <section className="relative mx-auto max-w-3xl px-6 pb-16">
          <p className="text-center text-xs uppercase tracking-widest opacity-60">
            Storyboard · Episode {storyboard.episodeNumber}
          </p>
          <h2 className="mt-1 text-center font-[family-name:var(--font-serif-display)] text-2xl">
            <Link href={`/episodes/${storyboard.episodeId}`} className="hover:opacity-80">
              {storyboard.episodeTitle}
            </Link>
          </h2>
          {storyboard.artistName && (
            <p className="mt-1 text-center text-sm opacity-70">
              Storyboard by{" "}
              {storyboard.artistId ? (
                <Link href={`/artists/${storyboard.artistId}`} className="underline underline-offset-2">
                  {storyboard.artistName}
                </Link>
              ) : (
                storyboard.artistName
              )}
            </p>
          )}
          <div className="mt-6 bg-parchment/70 backdrop-blur-sm">
            <GatedVideo
              endpoint={`/api/storyboard-video/${storyboard.episodeId}`}
              unlockTarget={{
                type: "episode",
                episodeId: storyboard.episodeId,
                episodeTitle: storyboard.episodeTitle,
                category: "Storyboard",
              }}
            />
          </div>
        </section>
      )}

      <section className="relative mx-auto grid max-w-4xl grid-cols-2 gap-4 px-6 pb-20 sm:grid-cols-4">
        {[
          { href: "/our-story", label: "Our Story" },
          { href: "/characters", label: "Characters" },
          { href: "/episodes", label: "Episodes" },
          { href: "/support", label: "Support" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="hairline flex items-center justify-center border bg-parchment/70 p-6 text-center text-sm tracking-wide backdrop-blur-sm transition-colors hover:bg-white/40 focus-visible:outline-2 focus-visible:outline-ink"
          >
            {item.label}
          </Link>
        ))}
      </section>
    </div>
  );
}
