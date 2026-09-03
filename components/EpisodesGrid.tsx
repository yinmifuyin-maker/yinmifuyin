"use client";

import { useState } from "react";
import type { Episode } from "@/lib/content";
import EpisodeCard from "./EpisodeCard";
import EpisodeOverlay from "./EpisodeOverlay";

export default function EpisodesGrid({ episodes }: { episodes: Episode[] }) {
  const [openEpisode, setOpenEpisode] = useState<Episode | null>(null);

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {episodes.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} onOpen={setOpenEpisode} />
        ))}
      </div>

      {openEpisode && (
        <EpisodeOverlay episode={openEpisode} onClose={() => setOpenEpisode(null)} />
      )}
    </>
  );
}
