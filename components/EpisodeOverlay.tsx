"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

// The dialog an episode book or short story scroll opens on the timeline.
export default function EpisodeOverlay({
  kicker,
  title,
  onClose,
  children,
}: {
  kicker: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Portalled to <body> so the dialog sits above the nav and footer, which
  // are lifted over each page's background art.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} content`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50"
      />

      <div className="gold-frame relative max-h-[85vh] w-full max-w-xl overflow-y-auto border-t-4 border-t-vermilion bg-parchment p-7 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="kicker">{kicker}</p>
            <h2 className="mt-1 font-[family-name:var(--font-serif-display)] text-3xl font-semibold">
              {title}
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
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
