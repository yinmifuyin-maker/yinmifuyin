"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ConceptArtImage } from "@/lib/sanity/queries";

const MIN_DELAY_MS = 10_000;
const MAX_DELAY_MS = 15_000;

function pickRandom<T>(pool: T[], avoid?: T): T {
  if (pool.length === 1) return pool[0];
  let choice: T;
  do {
    choice = pool[Math.floor(Math.random() * pool.length)];
  } while (choice === avoid);
  return choice;
}

function Side({
  pool,
  side,
  reducedMotion,
}: {
  pool: ConceptArtImage[];
  side: "left" | "right";
  reducedMotion: boolean;
}) {
  const first = pickRandom(pool);
  const [slots, setSlots] = useState<[ConceptArtImage, ConceptArtImage]>([first, pickRandom(pool, first)]);
  const [active, setActive] = useState<0 | 1>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reducedMotion || pool.length < 2) return;

    function scheduleNext() {
      const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
      timeoutRef.current = setTimeout(() => {
        setActive((current) => {
          const next = current === 0 ? 1 : 0;
          setSlots((prev) => {
            const updated: [ConceptArtImage, ConceptArtImage] = [...prev];
            updated[next] = pickRandom(pool, prev[current]);
            return updated;
          });
          return next;
        });
        scheduleNext();
      }, delay);
    }

    scheduleNext();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, pool.length]);

  const edgeClass = side === "left" ? "left-0 -translate-x-1/3" : "right-0 translate-x-1/3";

  return (
    <div className={`pointer-events-none fixed inset-y-0 ${edgeClass} -z-10 w-[26rem] max-w-[60vw] opacity-[0.08]`}>
      {slots.map((img, i) => (
        <Image
          key={side + i}
          src={img.url}
          alt=""
          aria-hidden
          fill
          sizes="26rem"
          quality={60}
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            active === i ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}

export default function HomeBackgroundArt({ images }: { images: ConceptArtImage[] }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (images.length === 0) return null;

  return (
    <>
      <Side pool={images} side="left" reducedMotion={reducedMotion} />
      <Side pool={images} side="right" reducedMotion={reducedMotion} />
    </>
  );
}
