/**
 * Honest "no real art yet" empty state — deliberately not a generated or stock image
 * standing in for real concept art. Matches the site's existing stamp-seal "Coming Soon"
 * treatment used on episode cards.
 */
export default function ArtComingSoon({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-white/20 text-center ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        className="h-8 w-8 opacity-30"
      >
        <rect x="3" y="4" width="18" height="16" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3 16l5-4.5 4 3 3-2.5 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="stamp-seal px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60">
        Art Coming Soon
      </span>
    </div>
  );
}
