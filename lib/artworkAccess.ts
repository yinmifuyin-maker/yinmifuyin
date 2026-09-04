import { isUnlocked } from "./unlock";
import { isFreeCharacter } from "./characterAccess";

/**
 * An artwork is unlocked if the whole character was unlocked (character-scope,
 * or one of the permanently free teaser characters), OR the artwork's artist's
 * full gallery was unlocked (gallery-scope) -- either purchase covers any piece
 * they share, so a visitor is never charged twice for the same artwork.
 */
export async function isArtworkUnlocked({
  characterId,
  artistId,
  isFreeSample,
}: {
  characterId: string;
  artistId: string;
  isFreeSample?: boolean;
}): Promise<boolean> {
  if (isFreeSample || isFreeCharacter(characterId)) return true;

  const [characterUnlocked, galleryUnlocked] = await Promise.all([
    isUnlocked("character", characterId),
    isUnlocked("gallery", artistId),
  ]);

  return characterUnlocked || galleryUnlocked;
}
