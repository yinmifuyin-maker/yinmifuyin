// Teaser-lead characters shown freely everywhere; every other character's
// artwork requires a per-character "Donate to Unlock" (see lib/unlock.ts,
// scope "character"). Keyed by slug.
const FREE_CHARACTER_IDS = new Set(["zhang-enlian", "fang-yimeng"]);

export function isFreeCharacter(characterId: string): boolean {
  return FREE_CHARACTER_IDS.has(characterId);
}
