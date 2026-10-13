"use client";

import Image from "next/image";
import { episodeHasAvailableContent, type Episode } from "@/lib/content";

// Cover cloths cycle through the brief's palette, so neighbours never match.
const COVERS = ["book--vermilion", "book--jade", "book--ink"] as const;

export default function EpisodeBook({
  number,
  episode,
  onOpen,
}: {
  number: number;
  episode?: Episode;
  onOpen: (episode: Episode) => void;
}) {
  const openable = episode ? episodeHasAvailableContent(episode) : false;
  const title = episode?.title ?? "Coming Soon";
  const cover = COVERS[(number - 1) % COVERS.length];

  const face = (
    <>
      {/* The first page, seen when the cover swings open on hover. */}
      <span aria-hidden className="book__page">
        <span className="kicker">Episode {number}</span>
        <span className="mt-2 font-[family-name:var(--font-serif-display)] text-lg font-semibold leading-tight text-ink">
          {title}
        </span>
        {openable && (
          <span className="mt-auto text-xs font-semibold uppercase tracking-[0.18em] text-vermilion">
            Open &rsaquo;
          </span>
        )}
      </span>

      <span className="book__cover">
        <span className="book__frame" />
        {episode?.hasCoverImage && (
          <Image
            src={episode.coverImageUrl}
            alt=""
            width={320}
            height={200}
            className="relative mx-auto mb-3 aspect-[8/5] w-full object-cover opacity-90 ring-1 ring-gold-soft/60"
          />
        )}
        <span className="relative text-[0.62rem] font-bold uppercase tracking-[0.24em] text-gold-soft">
          Episode
        </span>
        <span className="relative font-[family-name:var(--font-serif-display)] text-5xl font-semibold leading-none text-gold-soft lining-nums">
          {number}
        </span>
        <span className="relative mt-3 h-px w-10 bg-gold" />
        <span className="relative mt-3 px-1 font-[family-name:var(--font-serif-display)] text-lg font-semibold leading-tight text-parchment">
          {title}
        </span>
        {!openable && (
          <span className="relative mt-auto -rotate-6 rounded-full border-2 border-gold-soft/80 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gold-soft">
            Coming soon
          </span>
        )}
      </span>
      <span aria-hidden className="book__spine" />
    </>
  );

  return openable && episode ? (
    <button
      type="button"
      onClick={() => onOpen(episode)}
      aria-label={`View Episode ${number}: ${title}`}
      className={`book ${cover}`}
    >
      {face}
    </button>
  ) : (
    <div role="img" className={`book book--closed ${cover}`} aria-label={`Episode ${number}: ${title}, coming soon`}>
      {face}
    </div>
  );
}
