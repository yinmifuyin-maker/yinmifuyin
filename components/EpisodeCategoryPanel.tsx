"use client";

import { useEffect, useState } from "react";
import { EPISODE_CATEGORIES, type Episode } from "@/lib/content";
import EpisodeCategoryContent from "./EpisodeCategoryContent";
import EpisodePlayer from "./EpisodePlayer";
import GatedVideo from "./GatedVideo";
import AccessDisclaimer from "./AccessDisclaimer";
import UnlockModal from "./UnlockModal";
import ComingSoon from "./ComingSoon";

export default function EpisodeCategoryPanel({ episode }: { episode: Episode }) {
  const hasPaidAvailable = EPISODE_CATEGORIES.some(
    (c) => !c.free && episode.content[c.key]?.available
  );

  const [unlocked, setUnlocked] = useState<boolean | null>(hasPaidAvailable ? null : true);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [modalCategory, setModalCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPaidAvailable) return;
    let cancelled = false;

    fetch(`/api/episode-status/${episode.id}`)
      .then((res) => res.json())
      .then((data: { unlocked: boolean }) => {
        if (!cancelled) setUnlocked(data.unlocked);
      })
      .catch(() => {
        if (!cancelled) setUnlocked(false);
      });

    return () => {
      cancelled = true;
    };
  }, [episode.id, hasPaidAvailable]);

  return (
    <div>
      <div className="divide-y divide-ink/10">
        {EPISODE_CATEGORIES.map((cat) => {
          const entry = episode.content[cat.key];
          const available = !!entry?.available;
          const statusKnown = cat.free || unlocked !== null;
          const categoryUnlocked = cat.free || unlocked === true;
          // A storyboard video with a preview clip opens for everyone; the player
          // itself asks non-supporters to donate once the preview ends.
          const previewOnly =
            !categoryUnlocked && cat.key === "storyboard" && !!episode.content.storyboard?.previewPath;
          const canOpen = categoryUnlocked || previewOnly;
          const isOpen = expandedKey === cat.key;

          let rightLabel = "";
          if (available) {
            if (!statusKnown) rightLabel = "…";
            else if (categoryUnlocked) rightLabel = isOpen ? "Hide" : cat.free ? "Free — View" : "View";
            else if (previewOnly) rightLabel = isOpen ? "Hide" : "Free Preview";
            else rightLabel = "Donate to Unlock";
          }

          function handleClick() {
            if (!available || !statusKnown) return;
            if (!canOpen) {
              setModalCategory(cat.label);
              return;
            }
            setExpandedKey(isOpen ? null : cat.key);
          }

          return (
            <div key={cat.key} className="py-4">
              <button
                type="button"
                disabled={!available || !statusKnown}
                onClick={handleClick}
                className={`flex w-full items-center justify-between gap-4 text-left ${
                  available && statusKnown ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                }`}
              >
                <span className="font-[family-name:var(--font-serif-display)] text-lg">
                  {cat.label}
                </span>
                {!available ? (
                  <ComingSoon variant="row" />
                ) : (
                  <span
                    className={
                      statusKnown && !canOpen
                        ? "rounded-full border-2 border-brass px-3 py-1 text-xs font-medium uppercase tracking-widest text-ink"
                        : "text-xs uppercase tracking-widest opacity-60"
                    }
                  >
                    {rightLabel}
                  </span>
                )}
              </button>

              {available && isOpen && canOpen && (
                <div className="mt-4">
                  {cat.key === "fullEpisode" ? (
                    <EpisodePlayer episodeId={episode.id} episodeTitle={episode.title} />
                  ) : cat.key === "storyboard" ? (
                    <GatedVideo
                      endpoint={`/api/storyboard-video/${episode.id}`}
                      unlockTarget={{
                        type: "episode",
                        episodeId: episode.id,
                        episodeTitle: episode.title,
                        category: cat.label,
                      }}
                    />
                  ) : (
                    <EpisodeCategoryContent episodeId={episode.id} category={cat.key} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasPaidAvailable && <AccessDisclaimer />}

      {modalCategory && (
        <UnlockModal
          target={{
            type: "episode",
            episodeId: episode.id,
            episodeTitle: episode.title,
            category: modalCategory,
          }}
          onClose={() => setModalCategory(null)}
        />
      )}
    </div>
  );
}
