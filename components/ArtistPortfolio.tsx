"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import UnlockModal from "./UnlockModal";

export interface PortfolioItem {
  key: string;
  characterId: string;
  characterName: string;
  imageUrl: string;
  isFreeSample?: boolean;
  unlocked: boolean;
}

export default function ArtistPortfolio({
  artistId,
  artistName,
  items,
}: {
  artistId: string;
  artistName: string;
  items: PortfolioItem[];
}) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) {
    return <p className="mt-4 text-sm opacity-70">No credited work yet.</p>;
  }

  return (
    <div>
      <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
        {items.map((item) => {
          if (item.unlocked) {
            return (
              <Link
                key={item.key}
                href={`/characters/${item.characterId}`}
                className="group flex flex-col gap-2 focus-visible:outline-2 focus-visible:outline-ink"
              >
                <div className="hairline overflow-hidden border bg-white/40">
                  <Image
                    src={item.imageUrl}
                    alt={item.characterName}
                    width={400}
                    height={400}
                    className="aspect-square w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                  />
                </div>
                <p className="text-sm font-medium">{item.characterName}</p>
              </Link>
            );
          }

          return (
            <div key={item.key} className="flex flex-col gap-2">
              <div className="group relative overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.characterName}
                  width={400}
                  height={400}
                  className="aspect-square w-full scale-110 object-cover grayscale blur-sm transition-transform duration-300 motion-safe:group-hover:scale-125"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/25 transition-colors duration-300 group-hover:bg-ink/35">
                  <span className="inline-flex items-center justify-center rounded-full border-2 border-brass bg-parchment/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink transition-all duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-110 motion-safe:group-hover:shadow-[0_0_18px_4px_rgba(176,141,87,0.5)]">
                    Donate to Unlock
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  aria-label={`Donate to unlock ${item.characterName} artwork`}
                  className="absolute inset-0 z-10 cursor-pointer"
                />
              </div>
              <p className="text-sm font-medium opacity-50">{item.characterName}</p>
            </div>
          );
        })}
      </div>
      {open && (
        <UnlockModal
          target={{ type: "gallery", artistId, artistName }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
