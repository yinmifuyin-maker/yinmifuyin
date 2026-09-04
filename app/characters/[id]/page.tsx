import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacterById, getCharacters, getPrimaryArtwork } from "@/lib/content";
import { isUnlocked } from "@/lib/unlock";
import { isFreeCharacter } from "@/lib/characterAccess";
import ColorSwatch from "@/components/ColorSwatch";
import ArtComingSoon from "@/components/ArtComingSoon";
import CharacterUnlockCta from "@/components/CharacterUnlockCta";

export async function generateStaticParams() {
  const characters = await getCharacters();
  return characters.map((character) => ({ id: character.id }));
}

export default async function CharacterPage(
  props: PageProps<"/characters/[id]">
) {
  const { id } = await props.params;
  const character = await getCharacterById(id);

  if (!character) {
    notFound();
  }

  const unlocked = isFreeCharacter(character.id) || (await isUnlocked("character", character.id));

  const primary = getPrimaryArtwork(character);
  const moreArtworks = character.artworks.filter((a) => a !== primary);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/characters" className="text-sm opacity-70 hover:opacity-100">
        ← Back to Characters
      </Link>

      <div className="mt-8 grid gap-10 sm:grid-cols-[280px_1fr]">
        <div>
          <div className="hairline relative overflow-hidden border bg-white/40">
            {!primary ? (
              <ArtComingSoon className="aspect-square w-full" />
            ) : unlocked ? (
              <Image
                src={primary.imageUrl}
                alt={character.name}
                width={560}
                height={560}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <>
                <Image
                  src={primary.imageUrl}
                  alt={character.name}
                  width={560}
                  height={560}
                  className="aspect-square w-full scale-110 object-cover grayscale blur-sm"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/25">
                  <span className="inline-flex items-center justify-center rounded-full border-2 border-brass bg-parchment/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink">
                    Locked
                  </span>
                </div>
              </>
            )}
          </div>
          {primary && unlocked && (
            <p className="mt-2 text-xs opacity-60">
              Art by{" "}
              <Link
                href={`/artists/${primary.artistId}`}
                className="hand-underline font-medium opacity-100"
              >
                {primary.artistName}
              </Link>
            </p>
          )}
        </div>

        <div>
          <h1 className="font-[family-name:var(--font-serif-display)] text-3xl">
            {character.name}
          </h1>
          {character.originalName && (
            <p className="mt-1 text-lg opacity-70">{character.originalName}</p>
          )}
          {character.meaning && (
            <p className="mt-1 text-sm italic opacity-60">{character.meaning}</p>
          )}

          <p className="mt-6 text-base leading-relaxed opacity-90">{character.bio}</p>

          {(character.primaryColor || character.secondaryColor) && (
            <div className="mt-6 flex flex-col gap-2">
              {character.primaryColor && (
                <ColorSwatch label="Primary" color={character.primaryColor} />
              )}
              {character.secondaryColor && (
                <ColorSwatch label="Secondary" color={character.secondaryColor} />
              )}
            </div>
          )}

          {primary && !unlocked && (
            <div className="mt-6">
              <p className="text-sm leading-relaxed opacity-90">
                {character.name}&rsquo;s artwork is available to supporters. Unlock it to view
                the full piece{moreArtworks.length > 0 ? " and additional art" : ""}.
              </p>
              <div className="mt-4">
                <CharacterUnlockCta characterId={character.id} />
              </div>
            </div>
          )}
        </div>
      </div>

      {unlocked && moreArtworks.length > 0 && (
        <div className="mt-14">
          <div className="hairline border-t" />
          <h2 className="mt-10 text-sm uppercase tracking-widest opacity-60">More Art</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {moreArtworks.map((artwork, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="hairline overflow-hidden border bg-white/40">
                  <Image
                    src={artwork.imageUrl}
                    alt={character.name}
                    width={400}
                    height={400}
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <p className="text-xs opacity-60">
                  Art by{" "}
                  <Link
                    href={`/artists/${artwork.artistId}`}
                    className="hand-underline font-medium opacity-100"
                  >
                    {artwork.artistName}
                  </Link>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
