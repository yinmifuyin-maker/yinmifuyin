"use client";

import { useEffect, useRef, useState } from "react";
import type { Episode } from "@/lib/content";
import type { ResolvedTimelineEntry } from "@/lib/timeline";
import EpisodeBook from "./EpisodeBook";
import EpisodeOverlay from "./EpisodeOverlay";

// Every column shares these row heights so the books stand on one shelf line
// and the dates hang beneath it.
const UPPER = "h-[19rem]";
const NODE = "h-8";

function Column({
  entry,
  onOpen,
}: {
  entry: ResolvedTimelineEntry;
  onOpen: (episode: Episode) => void;
}) {
  if (entry.kind === "marker") {
    return (
      <li className="flex w-40 shrink-0 snap-start flex-col items-center">
        <div className={`${UPPER} flex items-end justify-center pb-1`}>
          <span aria-hidden className="h-24 w-px bg-gradient-to-b from-transparent to-gold" />
        </div>
        <div className={`${NODE} flex items-center justify-center`}>
          <span aria-hidden className="h-4 w-4 rotate-45 border-2 border-gold bg-vermilion" />
        </div>
        <div className="pt-3 text-center">
          <p className="whitespace-nowrap font-[family-name:var(--font-serif-display)] text-2xl font-bold text-vermilion lining-nums">
            {entry.label}
          </p>
          {entry.note && <p className="mt-1 text-xs italic text-ink-soft">{entry.note}</p>}
        </div>
      </li>
    );
  }

  if (entry.kind === "short") {
    return (
      <li className="flex w-44 shrink-0 snap-start flex-col items-center">
        <div className={`${UPPER} flex items-end justify-center pb-1`}>
          <div className="short-scroll">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-jade">
              Short story
            </p>
            <p className="mt-2 font-[family-name:var(--font-serif-display)] text-xl font-semibold leading-tight">
              {entry.title}
            </p>
          </div>
        </div>
        <div className={`${NODE} flex items-center justify-center`}>
          <span aria-hidden className="h-3 w-3 rounded-full border-2 border-jade bg-parchment" />
        </div>
        <p className="pt-3 text-center text-xs text-ink-soft">{entry.note}</p>
      </li>
    );
  }

  return (
    <li className="flex w-52 shrink-0 snap-start flex-col items-center">
      <div className={`${UPPER} flex items-end justify-center pb-1`}>
        <EpisodeBook number={entry.number} episode={entry.episode} onOpen={onOpen} />
      </div>
      <div className={`${NODE} flex items-center justify-center`}>
        <span aria-hidden className="h-3.5 w-3.5 rounded-full border-2 border-gold bg-ink" />
      </div>
      {entry.episode?.teaser && (
        <p className="w-48 pt-3 text-center text-xs leading-relaxed text-ink-soft">
          {entry.episode.teaser}
        </p>
      )}
    </li>
  );
}

export default function EpisodeTimeline({ entries }: { entries: ResolvedTimelineEntry[] }) {
  const [openEpisode, setOpenEpisode] = useState<Episode | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () =>
      setEdges({
        start: el.scrollLeft <= 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.7, behavior: "smooth" });

  return (
    <div className="relative mt-10">
      <div
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-label="Episode timeline. Scroll sideways to move through the story."
        className="timeline-scroll snap-x snap-mandatory overflow-x-auto pb-6 focus-visible:outline-offset-0"
      >
        <ol className="relative flex w-max items-start gap-4 px-[max(1.5rem,calc((100vw-72rem)/2))]">
          {/* The timeline itself: a double gold rule at the node row. */}
          <span
            aria-hidden
            className="timeline-rule pointer-events-none absolute inset-x-0 top-[calc(19rem+1rem)] -translate-y-1/2"
          />
          {entries.map((entry, i) => (
            <Column key={i} entry={entry} onOpen={setOpenEpisode} />
          ))}
        </ol>
      </div>

      {(["start", "end"] as const).map((side) => (
        <button
          key={side}
          type="button"
          onClick={() => scrollBy(side === "start" ? -1 : 1)}
          aria-label={side === "start" ? "Scroll timeline back" : "Scroll timeline forward"}
          disabled={edges[side]}
          className={`absolute top-[calc(19rem+1rem)] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold bg-ink text-xl text-gold-soft shadow-md transition-opacity hover:bg-vermilion disabled:pointer-events-none disabled:opacity-0 sm:flex ${
            side === "start" ? "left-3" : "right-3"
          }`}
        >
          {side === "start" ? "‹" : "›"}
        </button>
      ))}

      {openEpisode && (
        <EpisodeOverlay episode={openEpisode} onClose={() => setOpenEpisode(null)} />
      )}
    </div>
  );
}
