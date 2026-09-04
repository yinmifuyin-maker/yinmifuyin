import Image from "next/image";
import Link from "next/link";
import { getPrimaryArtwork, type Character } from "@/lib/content";
import ArtComingSoon from "./ArtComingSoon";

export default function CharacterCard({
  character,
  unlocked,
}: {
  character: Character;
  unlocked: boolean;
}) {
  const primary = getPrimaryArtwork(character);

  return (
    <Link
      href={`/characters/${character.id}`}
      className="group flex flex-col gap-2 focus-visible:outline-2 focus-visible:outline-ink"
    >
      <div className="hairline relative overflow-hidden border bg-white/40">
        {primary ? (
          <Image
            src={primary.imageUrl}
            alt={character.name}
            width={400}
            height={400}
            className={`aspect-square w-full object-cover transition-transform duration-300 ${
              unlocked
                ? "motion-safe:group-hover:scale-105"
                : "scale-110 grayscale blur-sm motion-safe:group-hover:scale-125"
            }`}
          />
        ) : (
          <ArtComingSoon className="aspect-square w-full" />
        )}

        {primary && !unlocked && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/25 transition-colors duration-300 group-hover:bg-ink/35">
            <span className="inline-flex items-center justify-center rounded-full border-2 border-brass bg-parchment/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink transition-all duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-110 motion-safe:group-hover:shadow-[0_0_18px_4px_rgba(176,141,87,0.5)]">
              Donate to Unlock
            </span>
          </div>
        )}
      </div>
      <div>
        <p className={`text-sm font-medium ${unlocked ? "" : "opacity-50"}`}>{character.name}</p>
        {character.originalName && (
          <p className="text-xs opacity-70">{character.originalName}</p>
        )}
      </div>
    </Link>
  );
}
