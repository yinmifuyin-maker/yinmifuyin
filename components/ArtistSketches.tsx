import type { SketchVideo } from "@/lib/content";
import GatedVideo from "./GatedVideo";

export default function ArtistSketches({
  artistId,
  artistName,
  sketches,
}: {
  artistId: string;
  artistName: string;
  sketches: SketchVideo[];
}) {
  return (
    <div className="mt-6 flex flex-col gap-10">
      {sketches.map((sketch) => (
        <div key={sketch.key}>
          <h3 className="mb-3 font-[family-name:var(--font-serif-display)] text-lg">{sketch.title}</h3>
          <GatedVideo
            endpoint={`/api/sketch-video/${artistId}/${sketch.key}`}
            unlockTarget={{ type: "gallery", artistId, artistName }}
          />
        </div>
      ))}
    </div>
  );
}
