"use client";

import { useState } from "react";

/**
 * Cross-fades between two pieces of content on hover/focus, using a shared
 * grid cell so both layers overlap without absolute-positioning math -- the
 * container's height follows the taller of the two, which matters once this
 * wraps multi-paragraph content rather than a single line of title text.
 */
export default function HoverReveal({
  base,
  reveal,
  className = "",
  baseClassName = "",
  revealClassName = "",
}: {
  base: React.ReactNode;
  reveal: React.ReactNode;
  className?: string;
  baseClassName?: string;
  revealClassName?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className={`grid ${className}`}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onFocus={() => setRevealed(true)}
      onBlur={() => setRevealed(false)}
      tabIndex={0}
    >
      <div
        className={`col-start-1 row-start-1 transition-all duration-500 ease-out motion-reduce:transition-none ${
          revealed ? "-translate-y-1.5 opacity-0" : "translate-y-0 opacity-100"
        } ${baseClassName}`}
      >
        {base}
      </div>
      <div
        aria-hidden={!revealed}
        className={`col-start-1 row-start-1 transition-all duration-500 ease-out motion-reduce:transition-none ${
          revealed ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
        } ${revealClassName}`}
      >
        {reveal}
      </div>
    </div>
  );
}
