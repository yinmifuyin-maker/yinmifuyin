"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ConceptArtImage } from "@/lib/sanity/queries";

function pickRandom<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

function Side({ pool, side }: { pool: ConceptArtImage[]; side: "left" | "right" }) {
  // Both sides start on the same, deterministic first pool item so server and client
  // render identical markup on the first pass -- Math.random() must never run during
  // SSR, or hydration will mismatch on the <Image src>. The real random pick happens
  // client-side after mount instead, in the effect below.
  const [image, setImage] = useState<ConceptArtImage>(pool[0]);
  const pickedRef = useRef(false);

  useEffect(() => {
    if (pickedRef.current) return;
    pickedRef.current = true;
    setImage(pickRandom(pool));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const edgeClass = side === "left" ? "left-0 -translate-x-1/3" : "right-0 translate-x-1/3";

  return (
    <div
      className={`bg-edge-fade pointer-events-none fixed inset-y-0 ${edgeClass} -z-10 w-[26rem] max-w-[60vw] overflow-hidden opacity-[0.08]`}
    >
      <Image
        src={image.url}
        alt=""
        aria-hidden
        fill
        sizes="26rem"
        quality={60}
        className="bg-drift object-cover"
      />
    </div>
  );
}

export default function HomeBackgroundArt({ images }: { images: ConceptArtImage[] }) {
  if (images.length === 0) return null;

  return (
    <>
      <Side pool={images} side="left" />
      <Side pool={images} side="right" />
    </>
  );
}
