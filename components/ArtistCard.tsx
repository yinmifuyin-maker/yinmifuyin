import Link from "next/link";
import type { Artist } from "@/lib/content";

export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link
      href={`/artists/${artist.id}`}
      className="hairline flex flex-col gap-2 border p-6 transition-colors hover:bg-white/40 focus-visible:outline-2 focus-visible:outline-ink"
    >
      <p className="font-[family-name:var(--font-serif-display)] text-lg">{artist.name}</p>
      <p className="text-sm opacity-80">{artist.role}</p>
      {artist.studio && <p className="text-xs opacity-60">{artist.studio}</p>}
      {artist.location && <p className="text-xs opacity-60">{artist.location}</p>}
    </Link>
  );
}
