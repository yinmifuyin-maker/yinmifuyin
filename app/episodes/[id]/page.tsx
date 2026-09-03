import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { episodeHasAvailableContent, getEpisodeById, getEpisodes } from "@/lib/content";
import EpisodeCategoryPanel from "@/components/EpisodeCategoryPanel";

export async function generateStaticParams() {
  const episodes = await getEpisodes();
  return episodes.map((episode) => ({ id: episode.id }));
}

export default async function EpisodePage(
  props: PageProps<"/episodes/[id]">
) {
  const { id } = await props.params;
  const episode = await getEpisodeById(id);

  if (!episode) {
    notFound();
  }

  const hasContent = episodeHasAvailableContent(episode);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/episodes" className="text-sm opacity-70 hover:opacity-100">
        ← Back to Episodes
      </Link>

      <p className="mt-8 text-xs uppercase tracking-widest opacity-60">
        Episode {episode.number}
      </p>
      <h1 className="font-[family-name:var(--font-serif-display)] text-3xl">
        {episode.title}
      </h1>

      <div className="hairline mt-6 overflow-hidden border bg-white/40">
        <Image
          src={episode.coverImageUrl}
          alt={episode.title}
          width={1000}
          height={625}
          className={`aspect-[8/5] w-full object-cover ${hasContent ? "" : "grayscale"}`}
        />
      </div>

      <div className="mt-8">
        <EpisodeCategoryPanel episode={episode} />
      </div>
    </div>
  );
}
