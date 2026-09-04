import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArtistById,
  getArtists,
  getCharactersByArtist,
} from "@/lib/content";
import { isArtworkUnlocked } from "@/lib/artworkAccess";
import ArtistPortfolio from "@/components/ArtistPortfolio";

export async function generateStaticParams() {
  const artists = await getArtists();
  return artists.map((artist) => ({ id: artist.id }));
}

export default async function ArtistPage(props: PageProps<"/artists/[id]">) {
  const { id } = await props.params;
  const artist = await getArtistById(id);

  if (!artist) {
    notFound();
  }

  const characters = await getCharactersByArtist(artist.id);
  const portfolio = characters.flatMap((character) =>
    character.artworks
      .filter((artwork) => artwork.artistId === artist.id)
      .map((artwork, i) => ({
        key: `${character.id}-${i}`,
        characterId: character.id,
        characterName: character.name,
        imageUrl: artwork.imageUrl,
        isFreeSample: artwork.isFreeSample,
      }))
  );

  const portfolioWithStatus = await Promise.all(
    portfolio.map(async (item) => ({
      ...item,
      unlocked: await isArtworkUnlocked({
        characterId: item.characterId,
        artistId: artist.id,
        isFreeSample: item.isFreeSample,
      }),
    }))
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/artists" className="text-sm opacity-70 hover:opacity-100">
        ← Back to Artists
      </Link>

      <div className="mt-8">
        <h1 className="font-[family-name:var(--font-serif-display)] text-3xl">
          {artist.name}
        </h1>
        <p className="mt-1 text-sm opacity-70">{artist.role}</p>
        {artist.studio && <p className="text-sm opacity-60">{artist.studio}</p>}
        {artist.location && <p className="text-sm opacity-60">{artist.location}</p>}
        <p className="mt-6 max-w-2xl text-base leading-relaxed opacity-90">{artist.bio}</p>
      </div>

      <div className="hairline my-12 border-t" />

      <h2 className="text-sm uppercase tracking-widest opacity-60">Portfolio</h2>
      <p className="mt-2 max-w-xl text-sm opacity-70">
        A couple of pieces are free to browse — the rest unlock with a single gallery
        donation, or by unlocking that character&rsquo;s artwork directly.
      </p>
      <ArtistPortfolio artistId={artist.id} artistName={artist.name} items={portfolioWithStatus} />
    </div>
  );
}
