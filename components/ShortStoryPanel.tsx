"use client";

import { useState } from "react";
import { SHORT_STORY_PARTS, type ShortStory, type ShortStoryPart } from "@/lib/content";
import ComingSoon from "./ComingSoon";
import ScreenplayViewer from "./ScreenplayViewer";

// A short story's synopsis and text, each opening as screenplay pages. Both are free.
export default function ShortStoryPanel({ story }: { story: ShortStory }) {
  const [open, setOpen] = useState<ShortStoryPart | null>(null);
  const openLabel = SHORT_STORY_PARTS.find((p) => p.key === open)?.label;

  return (
    <div className="divide-y divide-ink/10">
      {SHORT_STORY_PARTS.map((part) => {
        const available = story.available[part.key];
        return (
          <div key={part.key} className="py-4">
            <button
              type="button"
              disabled={!available}
              onClick={() => setOpen(part.key)}
              className={`flex w-full items-center justify-between gap-4 text-left ${
                available ? "cursor-pointer" : "cursor-not-allowed opacity-40"
              }`}
            >
              <span className="font-[family-name:var(--font-serif-display)] text-lg">{part.label}</span>
              {available ? (
                <span className="text-xs uppercase tracking-widest opacity-60">Free — Read</span>
              ) : (
                <ComingSoon variant="row" />
              )}
            </button>
          </div>
        );
      })}

      {open && openLabel && (
        <ScreenplayViewer
          endpoint={`/api/short-story-content/${story.id}/${open}`}
          kicker={`Short story · ${openLabel}`}
          title={story.title}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
