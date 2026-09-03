import type { Metadata } from "next";
import { getEpisodes } from "@/lib/content";
import EpisodesGrid from "@/components/EpisodesGrid";

export const metadata: Metadata = {
  title: "Episodes · The Hidden Gospel",
};

export default async function EpisodesPage() {
  const episodes = await getEpisodes();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-serif-display)] text-4xl">Episodes</h1>
      <p className="mt-2 max-w-xl text-sm opacity-70">
        New episodes are in active development. Click an episode to see what&rsquo;s
        available so far.
      </p>

      <EpisodesGrid episodes={episodes} />
    </div>
  );
}
