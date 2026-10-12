"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { HomeFigure } from "@/lib/sanity/queries";

// How long each figure stays up before the next one fades in. The right side
// runs half a cycle behind the left so the two never change at the same moment.
const HOLD_MS = 8000;
const FADE_MS = 1200;

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function preload(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = img.onerror = () => resolve();
    img.src = url;
  });
}

function Side({
  queue,
  side,
  delayMs,
}: {
  queue: HomeFigure[];
  side: "left" | "right";
  delayMs: number;
}) {
  // Two stacked layers that swap visibility, so the outgoing figure fades out
  // while the incoming one fades in rather than blinking through empty space.
  const [layers, setLayers] = useState<[HomeFigure, HomeFigure]>([queue[0], queue[0]]);
  const [front, setFront] = useState<0 | 1>(0);

  useEffect(() => {
    if (queue.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The first figure is fixed so server and client markup match on hydration;
    // everything after it plays in a fresh random order on each visit.
    const playlist = [queue[0], ...shuffle(queue.slice(1))];
    let index = 0;
    let current: 0 | 1 = 0;
    let cancelled = false;

    const advance = async () => {
      if (document.hidden) return;
      index = (index + 1) % playlist.length;
      const next = playlist[index];
      await preload(next.url);
      if (cancelled) return;
      const back: 0 | 1 = current === 0 ? 1 : 0;
      setLayers((prev) => {
        const updated: [HomeFigure, HomeFigure] = [prev[0], prev[1]];
        updated[back] = next;
        return updated;
      });
      current = back;
      setFront(back);
    };

    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      void advance();
      interval = setInterval(() => void advance(), HOLD_MS);
    }, HOLD_MS + delayMs);

    return () => {
      cancelled = true;
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [queue, delayMs]);

  const edgeClass = side === "left" ? "left-0 justify-start" : "right-0 justify-end";
  const alignClass = side === "left" ? "object-left-bottom" : "object-right-bottom";

  return (
    // Sized to the gutter beside the widest centred column on the page (the
    // max-w-4xl link cards, 56rem), so figures sit alongside the content
    // instead of behind it. No negative z-index:
    // that would paint them under the body's own parchment background.
    <div
      className={`pointer-events-none fixed bottom-3 ${edgeClass} flex h-[min(85vh,56rem)] w-[min(26rem,calc((100vw-56rem)/2-1rem))]`}
    >
      {layers.map((figure, i) => (
        <Image
          key={i}
          src={figure.url}
          alt=""
          fill
          unoptimized
          sizes="26rem"
          style={{ transitionDuration: `${FADE_MS}ms` }}
          className={`object-contain ${alignClass} transition-opacity ease-in-out ${
            front === i ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}

export default function HomeFigures({ figures }: { figures: HomeFigure[] }) {
  // Deal characters (not individual images) alternately to the two sides, so
  // all colourways of one character stay on one side and the same character
  // never shows on both at once.
  const [left, right] = useMemo(() => {
    const sides: [HomeFigure[], HomeFigure[]] = [[], []];
    const sideOf = new Map<string, 0 | 1>();
    for (const figure of figures) {
      let side = sideOf.get(figure.name);
      if (side === undefined) {
        side = (sideOf.size % 2) as 0 | 1;
        sideOf.set(figure.name, side);
      }
      sides[side].push(figure);
    }
    return sides;
  }, [figures]);

  if (left.length === 0) return null;

  return (
    <div aria-hidden className="hidden xl:block">
      <Side queue={left} side="left" delayMs={0} />
      {right.length > 0 && <Side queue={right} side="right" delayMs={HOLD_MS / 2} />}
    </div>
  );
}
