import type { Metadata } from "next";
import { getEpisodes, getArtistArtPool } from "@/lib/content";
import { resolveTimeline } from "@/lib/timeline";
import EpisodeTimeline from "@/components/EpisodeTimeline";
import PageBackgroundArt from "@/components/PageBackgroundArt";

export const metadata: Metadata = {
  title: "Episodes · The Hidden Gospel",
};

// Michael Carelse's and Jayden Thomas's character art take turns, faded,
// behind the timeline.
const BACKGROUND_ARTISTS = ["michael-carelse", "jayden-thomas"];

export default async function EpisodesPage() {
  const [episodes, ...pools] = await Promise.all([
    getEpisodes(),
    ...BACKGROUND_ARTISTS.map(getArtistArtPool),
  ]);

  return (
    <div className="relative isolate py-16">
      <PageBackgroundArt pools={pools} />

      <p className="absolute left-4 top-4 rounded-full border border-gold bg-parchment/85 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-vermilion sm:left-6">
        All art is human made
      </p>

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
