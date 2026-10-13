import type { Episode, ShortStory } from "./content";

// The Episodes page timeline, left to right. Episodes come from Sanity by
// number; the dates and short stories are placed from the writing so far:
//
// - "Hidden" (Hidden Shorts, February 2026 screenplay) opens in an African
//   village at "Unknown time", then dates its sections AD 824 ("Soil") and
//   AD 830 ("Infiltration Part One"). AD 824 is the earliest date in the writing.
// - Episode 10 is Episode 1's flash forward to Enlian's trial, so it closes
//   the line.
//
// Where the shorts sit between episodes is a best reading of the story arcs
// (Soil before the academy is formed; Infiltration alongside the Episode 4
// banquet heist). Reorder entries here to move them.
//
// Short stories are written in Studio as Short Story documents and matched here
// by slug; the title and note below show until that document exists.

export type TimelineEntry =
  | { kind: "marker"; label: string; note?: string }
  | { kind: "short"; slug: string; title: string; note: string }
  | { kind: "episode"; number: number }
  // Any Sanity episode not placed explicitly lands here, in number order.
  | { kind: "otherEpisodes" }
  // Likewise any Sanity short story whose slug isn't placed.
  | { kind: "otherShorts" };

export const TIMELINE: TimelineEntry[] = [
  { kind: "marker", label: "Unknown time" },
  { kind: "short", slug: "hidden", title: "Hidden", note: "Short story · An African village" },
  { kind: "marker", label: "AD 824" },
  { kind: "short", slug: "soil", title: "Soil", note: "Short story · Hidden" },
  { kind: "episode", number: 1 },
  { kind: "episode", number: 2 },
  { kind: "episode", number: 3 },
  { kind: "marker", label: "AD 830" },
  { kind: "short", slug: "infiltration-part-one", title: "Infiltration Part One", note: "Short story · Hidden" },
  { kind: "episode", number: 4 },
  { kind: "otherEpisodes" },
  { kind: "otherShorts" },
  { kind: "marker", label: "Flash forward", note: "The trial of Enlian" },
  { kind: "episode", number: 10 },
];

export type ResolvedTimelineEntry =
  | { kind: "marker"; label: string; note?: string }
  // story is undefined when Studio has no Short Story with that slug yet.
  | { kind: "short"; slug: string; title: string; note: string; story?: ShortStory }
  // episode is undefined when Sanity has no episode with that number yet.
  | { kind: "episode"; number: number; episode?: Episode };

export function resolveTimeline(episodes: Episode[], shorts: ShortStory[]): ResolvedTimelineEntry[] {
  const byNumber = new Map(episodes.map((e) => [e.number, e]));
  const placed = new Set(
    TIMELINE.flatMap((t) => (t.kind === "episode" ? [t.number] : []))
  );
  const bySlug = new Map(shorts.map((s) => [s.id, s]));
  const placedShorts = new Set(TIMELINE.flatMap((t) => (t.kind === "short" ? [t.slug] : [])));
  const shortEntry = (slug: string, title: string, note: string, story?: ShortStory): ResolvedTimelineEntry => ({
    kind: "short",
    slug,
    title: story?.title ?? title,
    note: story?.note ?? note,
    story,
  });

  return TIMELINE.flatMap((entry): ResolvedTimelineEntry[] => {
    if (entry.kind === "episode") {
      return [{ kind: "episode", number: entry.number, episode: byNumber.get(entry.number) }];
    }
    if (entry.kind === "otherEpisodes") {
      return episodes
        .filter((e) => !placed.has(e.number))
        .sort((a, b) => a.number - b.number)
        .map((e) => ({ kind: "episode", number: e.number, episode: e }));
    }
    if (entry.kind === "short") {
      return [shortEntry(entry.slug, entry.title, entry.note, bySlug.get(entry.slug))];
    }
    if (entry.kind === "otherShorts") {
      return shorts
        .filter((s) => !placedShorts.has(s.id))
        .map((s) => shortEntry(s.id, s.title, "Short story", s));
    }
    return [entry];
  });
}
