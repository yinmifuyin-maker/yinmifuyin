import type { Metadata } from "next";
import { getCharactersByGroup, type Character } from "@/lib/content";
import { isUnlocked } from "@/lib/unlock";
import { isFreeCharacter } from "@/lib/characterAccess";
import CharacterCard from "@/components/CharacterCard";

export const metadata: Metadata = {
  title: "Characters · The Hidden Gospel",
};

async function withUnlockStatus(characters: Character[]) {
  return Promise.all(
    characters.map(async (character) => ({
      character,
      unlocked: isFreeCharacter(character.id) || (await isUnlocked("character", character.id)),
    }))
  );
}

export default async function CharactersPage() {
  const [academy, extended] = await Promise.all([
    getCharactersByGroup("academy"),
    getCharactersByGroup("extended"),
  ]);

  const [academyWithStatus, extendedWithStatus] = await Promise.all([
    withUnlockStatus(academy),
    withUnlockStatus(extended),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-serif-display)] text-4xl">Characters</h1>
      <p className="mt-2 max-w-xl text-sm opacity-70">
        Zhang Enlian and Fang Yimeng are free to browse as the series&rsquo; teaser leads —
        every other character&rsquo;s artwork unlocks with a small donation.
      </p>

      <section className="mt-10">
        <h2 className="text-sm uppercase tracking-widest opacity-60">The Academy</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {academyWithStatus.map(({ character, unlocked }) => (
            <CharacterCard key={character.id} character={character} unlocked={unlocked} />
          ))}
        </div>
      </section>

      <div className="hairline my-14 border-t" />

      <section>
        <h2 className="text-sm uppercase tracking-widest opacity-60">Extended Cast</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {extendedWithStatus.map(({ character, unlocked }) => (
            <CharacterCard key={character.id} character={character} unlocked={unlocked} />
          ))}
        </div>
      </section>
    </div>
  );
}
