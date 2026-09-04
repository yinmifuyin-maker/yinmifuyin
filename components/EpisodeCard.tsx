"use client";

import Image from "next/image";
import { episodeHasAvailableContent, type Episode } from "@/lib/content";
import ComingSoon from "./ComingSoon";

export default function EpisodeCard({
  episode,
  onOpen,
}: {
  episode: Episode;
  onOpen: (episode: Episode) => void;
}) {
  const hasContent = episodeHasAvailableContent(episode);

  return (
    <div className="hairline flex flex-col gap-3 border p-4">
      <div className="group relative overflow-hidden">
        <Image
          src={episode.coverImageUrl}
          alt={episode.title}
          width={800}
          height={500}
          className={`aspect-[8/5] w-full object-cover transition-transform duration-300 ${
            hasContent ? "motion-safe:group-hover:scale-105" : "grayscale"
          }`}
        />

        {!hasContent && <ComingSoon variant="card" />}

        {hasContent && (
          <>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="inline-flex items-center justify-center rounded-full border-2 border-brass bg-parchment/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink transition-all duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-110 motion-safe:group-hover:shadow-[0_0_18px_4px_rgba(176,141,87,0.5)]">
                View Episode
              </span>
            </div>
            <button
              type="button"
              onClick={() => onOpen(episode)}
              aria-label={`View Episode ${episode.number}: ${episode.title}`}
              className="absolute inset-0 z-10 cursor-pointer"
            />
          </>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest opacity-60">
          Episode {episode.number}
        </p>
        <p
          className={`font-[family-name:var(--font-serif-display)] text-lg ${
            hasContent ? "" : "opacity-50"
          }`}
        >
          {episode.title}
        </p>
        {episode.teaser && (
          <p className="mt-2 text-sm opacity-80">{episode.teaser}</p>
        )}
      </div>
    </div>
  );
}
