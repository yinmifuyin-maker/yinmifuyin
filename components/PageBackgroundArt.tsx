import Image from "next/image";
import type { ConceptArtImage } from "@/lib/sanity/queries";

/**
 * A faded band of character art behind a page's content, fixed to the
 * viewport. The page wrapper must be `relative isolate` so the -z-10 layer
 * paints above the body's parchment rather than under it.
 */
export default function PageBackgroundArt({
  images,
  count = 5,
}: {
  images: ConceptArtImage[];
  count?: number;
}) {
  if (images.length === 0) return null;
  const shown = images.slice(0, count);

  return (
    <div
      aria-hidden
      className="bg-band-fade pointer-events-none fixed inset-0 -z-10 flex justify-center overflow-hidden opacity-[0.1]"
    >
      {shown.map((image, i) => (
        <div key={image.url} className={`relative h-full min-w-[18rem] flex-1 ${i % 2 ? "translate-y-10" : ""}`}>
          <Image
            src={image.url}
            alt=""
            fill
            sizes="(min-width: 1280px) 20vw, 18rem"
            className="object-cover sepia-[.35]"
          />
        </div>
      ))}
    </div>
  );
}
