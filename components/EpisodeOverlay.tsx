"use client";

import { useEffect } from "react";
import type { Episode } from "@/lib/content";
import EpisodeCategoryPanel from "./EpisodeCategoryPanel";

export default function EpisodeOverlay({
  episode,
  onClose,
}: {
  episode: Episode;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${episode.title} content`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50"
      />

      <div className="hairline relative max-h-[85vh] w-full max-w-xl overflow-y-auto border bg-parchment p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-60">
              Episode {episode.number}
            </p>
            <h2 className="font-[family-name:var(--font-serif-display)] text-2xl">
              {episode.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hairline shrink-0 rounded-full border px-3 py-1 text-sm opacity-70 hover:opacity-100"
          >
            Close
          </button>
        </div>

        <div className="mt-6">
          <EpisodeCategoryPanel episode={episode} />
        </div>
      </div>
    </div>
  );
}
