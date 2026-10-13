"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ConceptArtImage } from "@/lib/sanity/queries";

// How long one artist's band stays up before the other's fades in.
const HOLD_MS = 14000;
const FADE_MS = 2000;

function sample<T>(pool: T[], n: number): T[] {
  const out = [...pool];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, n);
}

function Band({ images, visible }: { images: ConceptArtImage[]; visible: boolean }) {
  return (
    <div
      style={{ transitionDuration: `${FADE_MS}ms` }}
      className={`absolute inset-0 flex justify-center transition-opacity ease-in-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {images.map((image, i) => (
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

/**
 * A faded band of character art behind a page's content, fixed to the
 * viewport. With several artists it switches between them at random, one
 * artist's pieces at a time. The page wrapper must be `relative isolate` so
 * the -z-10 layer paints above the body's parchment rather than under it.
 */
export default function PageBackgroundArt({
  pools,
  count = 5,
}: {
  pools: ConceptArtImage[][];
  count?: number;
}) {
  const filled = pools.filter((p) => p.length > 0);

  // The first band is deterministic so server and client markup match on
  // hydration; random picks start after mount.
  const [layers, setLayers] = useState<[ConceptArtImage[], ConceptArtImage[]]>(() => [
    (filled[0] ?? []).slice(0, count),
    [],
  ]);
  const [front, setFront] = useState<0 | 1>(0);

  useEffect(() => {
    if (filled.length === 0) return;
    let artist = Math.floor(Math.random() * filled.length);
    let current: 0 | 1 = 0;
    const first = window.setTimeout(() => setLayers([sample(filled[artist], count), []]), 0);

    if (filled.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => window.clearTimeout(first);
    }

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      // Always hand over to a different artist.
      artist = (artist + 1 + Math.floor(Math.random() * (filled.length - 1))) % filled.length;
      const next = sample(filled[artist], count);
      const back: 0 | 1 = current === 0 ? 1 : 0;
      setLayers((prev) => {
        const out: [ConceptArtImage[], ConceptArtImage[]] = [prev[0], prev[1]];
        out[back] = next;
        return out;
      });
      current = back;
      // Let the incoming images mount before fading them in.
      window.setTimeout(() => setFront(back), 300);
    }, HOLD_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (filled.length === 0) return null;

  return (
    <div
      aria-hidden
      className="bg-band-fade pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-[0.1]"
    >
      <Band images={layers[0]} visible={front === 0} />
      <Band images={layers[1]} visible={front === 1} />
    </div>
  );
}
