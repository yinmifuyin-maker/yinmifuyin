import type { Metadata } from "next";
import { getUseOfProceeds } from "@/lib/content";
import type { UseOfProceedsPhaseWithGoal, UseOfProceedsPhaseWithStatus } from "@/lib/content";

export const metadata: Metadata = {
  title: "Use of Proceeds · The Hidden Gospel",
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function PhaseWithGoal({ phase }: { phase: UseOfProceedsPhaseWithGoal }) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-serif-display)] text-2xl">{phase.title}</h2>

      {typeof phase.goalAmountUSD === "number" && (
        <p className="mt-3 text-xl font-medium tracking-wide text-brass">
          {usd.format(phase.goalAmountUSD)}
        </p>
      )}
      {phase.goalDisclaimer && (
        <p className="mt-1 text-xs italic opacity-60">{phase.goalDisclaimer}</p>
      )}

      {phase.description && (
        <p className="mt-4 text-base leading-relaxed opacity-90">{phase.description}</p>
      )}
    </section>
  );
}

function PhaseWithStatus({ phase }: { phase: UseOfProceedsPhaseWithStatus }) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-serif-display)] text-2xl">{phase.title}</h2>

      {phase.goalStatus && (
        <p className="mt-3 text-xs font-medium uppercase tracking-widest opacity-60">
          {phase.goalStatus}
        </p>
      )}

      {phase.description && (
        <p className="mt-4 text-base leading-relaxed opacity-90">{phase.description}</p>
      )}
    </section>
  );
}

export default async function UseOfProceedsPage() {
  const data = await getUseOfProceeds();

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-[family-name:var(--font-serif-display)] text-4xl">Use of Proceeds</h1>
        <p className="mt-6 text-base leading-relaxed opacity-90">
          This page is not available yet. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-serif-display)] text-4xl">{data.title}</h1>
      {data.lastUpdatedNote && (
        <p className="mt-2 text-xs uppercase tracking-widest opacity-50">
          {data.lastUpdatedNote}
        </p>
      )}

      {data.intro && (
        <p className="mt-8 text-base leading-relaxed opacity-90">{data.intro}</p>
      )}

      {data.splitExplanation && (
        <p className="mt-6 text-base leading-relaxed opacity-90">{data.splitExplanation}</p>
      )}

      {data.transparencyNote && (
        <p className="mt-6 text-sm leading-relaxed opacity-70">{data.transparencyNote}</p>
      )}

      <div className="mt-14 space-y-14">
        {data.phase1 && (
          <>
            <PhaseWithGoal phase={data.phase1} />
            <div className="hairline border-t" />
          </>
        )}
        {data.phase2 && (
          <>
            <PhaseWithStatus phase={data.phase2} />
            <div className="hairline border-t" />
          </>
        )}
        {data.phase3 && <PhaseWithStatus phase={data.phase3} />}
      </div>

      {data.episodeUnlockNote && (
        <div className="hairline mt-14 border p-6 text-sm leading-relaxed opacity-80">
          {data.episodeUnlockNote}
        </div>
      )}
    </div>
  );
}
