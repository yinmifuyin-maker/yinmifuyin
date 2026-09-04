type ComingSoonVariant = "card" | "row" | "box";

/**
 * Shared "not available yet" indicator -- the stamp-seal is the one consistent
 * visual language across every context (grid card overlay, list row, and the
 * "no art uploaded" placeholder box); only size and layout adapt per context.
 */
export default function ComingSoon({
  variant,
  label = "Coming Soon",
  className = "",
}: {
  variant: ComingSoonVariant;
  label?: string;
  className?: string;
}) {
  if (variant === "row") {
    return (
      <span
        className={`stamp-seal px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${className}`}
      >
        {label}
      </span>
    );
  }

  if (variant === "box") {
    // Honest "no real art yet" empty state -- deliberately not a generated or
    // stock image standing in for real concept art.
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-white/20 text-center ${className}`}
      >
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-8 w-8 opacity-30">
          <rect x="3" y="4" width="18" height="16" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M3 16l5-4.5 4 3 3-2.5 6 5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="stamp-seal px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/10 ${className}`}
    >
      <span className="stamp-seal -rotate-12 bg-parchment/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  );
}
