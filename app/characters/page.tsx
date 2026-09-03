import type { Metadata } from "next";
import { getCharactersByGroup } from "@/lib/content";
import CharacterCard from "@/components/CharacterCard";

export const metadata: Metadata = {
  title: "Characters · The Hidden Gospel",
};

export default async function CharactersPage() {
  const [academy, extended] = await Promise.all([
    getCharactersByGroup("academy"),
    getCharactersByGroup("extended"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-serif-display)] text-4xl">Characters</h1>

      <section className="mt-10">
        <h2 className="text-sm uppercase tracking-widest opacity-60">The Academy</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {academy.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      </section>

      <div className="hairline my-14 border-t" />

      <section>
        <h2 className="text-sm uppercase tracking-widest opacity-60">Extended Cast</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {extended.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      </section>
    </div>
  );
}
