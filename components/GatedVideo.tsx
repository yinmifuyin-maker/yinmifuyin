"use client";

import { useEffect, useState } from "react";
import type { UnlockTarget } from "@/lib/unlockTarget";
import UnlockModal from "./UnlockModal";

type VideoState =
  | { status: "loading" }
  | { status: "ready"; url: string; preview: boolean }
  | { status: "locked" }
  | { status: "error" };

const donateButtonClass =
  "inline-flex items-center justify-center rounded-full border-2 border-brass px-5 py-2 text-sm font-medium tracking-wide text-ink transition-colors hover:bg-brass/10";

/**
 * A video with a free preview: supporters get the full video, everyone else
 * the short preview clip, followed by a prompt to donate. `endpoint` is one of
 * the routes built on gatedVideoResponse (lib/videoAccess.ts).
 */
export default function GatedVideo({
  endpoint,
  unlockTarget,
}: {
  endpoint: string;
  unlockTarget: UnlockTarget;
}) {
  const [state, setState] = useState<VideoState>({ status: "loading" });
  const [previewEnded, setPreviewEnded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchSignedUrl() {
      try {
        const res = await fetch(endpoint);
        if (cancelled) return;

        if (res.status === 401) {
          setState({ status: "locked" });
          return;
        }

        if (!res.ok) {
          setState({ status: "error" });
          return;
        }

        const data = (await res.json()) as { url: string; preview: boolean };
        setState({ status: "ready", url: data.url, preview: data.preview });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    fetchSignedUrl();

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  const modal = modalOpen && (
    <UnlockModal target={unlockTarget} onClose={() => setModalOpen(false)} />
  );

  if (state.status === "loading") {
    return (
      <div
        aria-busy="true"
        className="hairline flex aspect-video w-full items-center justify-center border bg-white/40 text-sm opacity-60"
      >
        Loading video…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <p className="text-sm opacity-70">
        The video could not be loaded right now. Please try again shortly.
      </p>
    );
  }

  if (state.status === "locked") {
    return (
      <div>
        <p className="text-base leading-relaxed opacity-90">
          This video is available to supporters.
        </p>
        <div className="mt-4">
          <button type="button" onClick={() => setModalOpen(true)} className={donateButtonClass}>
            Donate to Unlock
          </button>
        </div>
        {modal}
      </div>
    );
  }

  return (
    <div>
      {state.preview && (
        <p className="mb-2 text-xs uppercase tracking-widest opacity-60">Free preview</p>
      )}
      <div className="relative">
        <video
          controls
          className="hairline aspect-video w-full border bg-black"
          src={state.url}
          onEnded={() => state.preview && setPreviewEnded(true)}
          onPlay={() => setPreviewEnded(false)}
        >
          Your browser does not support embedded video.
        </video>
        {state.preview && previewEnded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/70 px-6 text-center text-parchment">
            <p className="text-base">Donate to watch the full video.</p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center rounded-full border-2 border-brass bg-parchment px-5 py-2 text-sm font-medium tracking-wide text-ink"
            >
              Donate to Unlock
            </button>
          </div>
        )}
      </div>
      {state.preview && !previewEnded && (
        <div className="mt-3">
          <button type="button" onClick={() => setModalOpen(true)} className={donateButtonClass}>
            Donate to watch the full video
          </button>
        </div>
      )}
      {modal}
    </div>
  );
}
