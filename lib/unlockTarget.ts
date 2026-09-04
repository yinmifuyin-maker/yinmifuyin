import type { UnlockScope } from "./unlock";

export type UnlockTarget =
  | { type: "donate" }
  | { type: "episode"; episodeId: string; episodeTitle: string; category?: string }
  | { type: "character"; characterId: string; characterName: string }
  | { type: "gallery"; artistId: string; artistName: string };

const LOW_MIN = 5; // donate, character art, individual gallery pieces
const HIGH_MIN = 15; // episode content (sneak peeks, scripts, storyboards, full episodes)

export function minAmountFor(target: Pick<UnlockTarget, "type">): number {
  return target.type === "episode" ? HIGH_MIN : LOW_MIN;
}

export function presetsFor(minAmount: number): number[] {
  return minAmount >= HIGH_MIN ? [15, 30, 50] : [5, 15, 50];
}

export function titleFor(target: UnlockTarget): string {
  switch (target.type) {
    case "donate":
      return "Support the Project";
    case "episode":
      return target.category ? `Unlock ${target.category}` : `Unlock ${target.episodeTitle}`;
    case "character":
      return `Unlock ${target.characterName}’s Artwork`;
    case "gallery":
      return `Unlock ${target.artistName}’s Gallery`;
  }
}

/** The unlock scope + subject id an access code (or a completed payment) applies to. Undefined for plain donations, which unlock nothing. */
export function unlockScopeFor(target: UnlockTarget): { scope: UnlockScope; subjectId: string } | undefined {
  switch (target.type) {
    case "episode":
      return { scope: "episode", subjectId: target.episodeId };
    case "character":
      return { scope: "character", subjectId: target.characterId };
    case "gallery":
      return { scope: "gallery", subjectId: target.artistId };
    case "donate":
      return undefined;
  }
}
