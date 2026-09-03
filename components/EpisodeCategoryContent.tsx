"use client";

import { useEffect, useState } from "react";
import EpisodeScript from "./EpisodeScript";

type State =
  | { status: "loading" }
  | { status: "ready"; text: string }
  | { status: "error" };

export default function EpisodeCategoryContent({
  episodeId,
  category,
}: {
  episodeId: string;
  category: "synopsis" | "sneakPeek" | "fullScript" | "storyboard";
}) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/episode-content/${episodeId}/${category}`);
        if (cancelled) return;

        if (!res.ok) {
          setState({ status: "error" });
          return;
        }

        const data = (await res.json()) as { content: string };
        setState({ status: "ready", text: data.content });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [episodeId, category]);

  if (state.status === "loading") {
    return <p className="text-sm opacity-60">Loading…</p>;
  }

  if (state.status === "error") {
    return (
      <p className="text-sm opacity-70">
        This couldn&rsquo;t be loaded right now. Please try again shortly.
      </p>
    );
  }

  return <EpisodeScript content={state.text} />;
}
