"use client";

import { useCheckout } from "@/hooks/useCheckout";
import AccessCodeForm from "./AccessCodeForm";

export default function UnlockButton({ episodeId }: { episodeId: string }) {
  const { loading, error, startCheckout } = useCheckout(episodeId);

  return (
    <div className="flex flex-col items-start">
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full border-2 border-brass px-5 py-2 text-sm font-medium tracking-wide text-ink transition-colors hover:bg-brass/10 disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Donate to Unlock"}
      </button>
      {error && <p className="mt-2 text-sm opacity-70">{error}</p>}
      <AccessCodeForm scope="episode" subjectId={episodeId} />
    </div>
  );
}
