import type { Metadata } from "next";
import { getEpisodes, getArtistArtPool } from "@/lib/content";
import { resolveTimeline } from "@/lib/timeline";
import EpisodeTimeline from "@/components/EpisodeTimeline";
import PageBackgroundArt from "@/components/PageBackgroundArt";

export const metadata: Metadata = {
  title: "Episodes · The Hidden Gospel",
};

// Michael Carelse's concept art sits faded behind the timeline.
const BACKGROUND_ARTIST = "michael-carelse";

export default async function EpisodesPage() {
  const [episodes, art] = await Promise.all([
    getEpisodes(),
    getArtistArtPool(BACKGROUND_ARTIST),
  ]);

  return (
    <div className="relative isolate py-16">
      <PageBackgroundArt images={art} />

      <div className="mx-auto max-w-6xl px-6">
        <p className="kicker">The timeline</p>
        <h1 className="mt-2 font-[family-name:var(--font-serif-display)] text-5xl font-semibold">
          Episodes
        </h1>
        <div aria-hidden className="gold-rule mt-4" />
        <p className="mt-4 max-w-xl text-sm text-ink-soft">
          New episodes are in active development. Click an episode to see what&rsquo;s
          available so far.
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-soft/80">
          Scroll sideways to follow the story &rarr;
        </p>
      </div>

      <EpisodeTimeline entries={resolveTimeline(episodes)} />
    </div>
  );
}
