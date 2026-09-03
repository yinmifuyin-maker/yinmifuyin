"use client";

import { useEffect, useState } from "react";
import UnlockButton from "./UnlockButton";

type PlayerState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "locked" }
  | { status: "error" };

export default function EpisodePlayer({ episodeId }: { episodeId: string }) {
  const [state, setState] = useState<PlayerState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function fetchSignedUrl() {
      try {
        const res = await fetch(`/api/video/${episodeId}`);
        if (cancelled) return;

        if (res.status === 401) {
          setState({ status: "locked" });
          return;
        }

        if (!res.ok) {
          setState({ status: "error" });
          return;
        }

        const data = (await res.json()) as { url: string };
        setState({ status: "ready", url: data.url });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    fetchSignedUrl();

    return () => {
      cancelled = true;
    };
  }, [episodeId]);

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

  if (state.status === "locked") {
    return (
      <div>
        <p className="text-base leading-relaxed opacity-90">
          This episode is available to supporters. Unlock it to watch the full episode.
        </p>
        <div className="mt-4">
          <UnlockButton episodeId={episodeId} />
        </div>
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

  return (
    <video
      controls
      className="hairline aspect-video w-full border bg-black"
      src={state.url}
    >
      Your browser does not support embedded video.
    </video>
  );
}
