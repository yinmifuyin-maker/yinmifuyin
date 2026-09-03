import type { Metadata } from "next";
import { getArtists } from "@/lib/content";
import ArtistCard from "@/components/ArtistCard";

export const metadata: Metadata = {
  title: "Artists · The Hidden Gospel",
};

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-serif-display)] text-4xl">Artists</h1>
      <p className="mt-2 max-w-xl text-sm opacity-70">
        The visual world of The Hidden Gospel is being built by a small, dedicated team.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </div>
  );
}
