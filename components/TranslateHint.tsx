/**
 * Discovery affordance for hover-to-reveal translation blocks -- separate
 * from the global EN/中文 toggle, which stays exactly where it is in the nav.
 */
export default function TranslateHint({
  label = "Hover to read in English",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-widest opacity-50 ${className}`}
    >
      <span
        aria-hidden
        className="hairline flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium normal-case tracking-normal"
      >
        文
      </span>
      <span>{label}</span>
    </div>
  );
}
