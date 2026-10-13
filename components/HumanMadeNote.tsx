/** Shown at the top left of every page (see app/layout.tsx). */
export default function HumanMadeNote() {
  return (
    <p className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-gold bg-parchment/85 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-vermilion sm:left-6">
      All art is human made
    </p>
  );
}
