"use client";

import { useState } from "react";

export default function HeroTitle({
  titleZh,
  title,
}: {
  titleZh?: string;
  title?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onFocus={() => setRevealed(true)}
      onBlur={() => setRevealed(false)}
      tabIndex={title ? 0 : undefined}
    >
      <h1
        className={`font-[family-name:var(--font-calligraphy)] text-6xl leading-none transition-all duration-500 ease-out motion-reduce:transition-none sm:text-8xl ${
          revealed ? "-translate-y-1.5 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        {titleZh}
      </h1>
      <p
        aria-hidden={!revealed}
        className={`absolute inset-0 flex items-center justify-center whitespace-nowrap font-[family-name:var(--font-serif-display)] text-3xl transition-all duration-500 ease-out motion-reduce:transition-none sm:text-5xl ${
          revealed ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
        }`}
      >
        {title}
      </p>
    </div>
  );
}
