import Image from "next/image";
import Link from "next/link";
import { getPrimaryArtwork, type Character } from "@/lib/content";
import ArtComingSoon from "./ArtComingSoon";

export default function CharacterCard({ character }: { character: Character }) {
  const primary = getPrimaryArtwork(character);

  return (
    <Link
      href={`/characters/${character.id}`}
      className="group flex flex-col gap-2 focus-visible:outline-2 focus-visible:outline-ink"
    >
      <div className="hairline overflow-hidden border bg-white/40">
        {primary ? (
          <Image
            src={primary.imageUrl}
            alt={character.name}
            width={400}
            height={400}
            className="aspect-square w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
          />
        ) : (
          <ArtComingSoon className="aspect-square w-full" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium">{character.name}</p>
        {character.originalName && (
          <p className="text-xs opacity-70">{character.originalName}</p>
        )}
      </div>
    </Link>
  );
}
