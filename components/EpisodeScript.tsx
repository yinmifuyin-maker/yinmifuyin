const CUE_PATTERN = /^[A-Z0-9 .,'()-]+$/;
const SCENE_HEADING_PATTERN = /^(INT\.|EXT\.|CUT TO:)/;

export default function EpisodeScript({ content }: { content: string }) {
  const blocks = content.trim().split(/\n{2,}/);

  return (
    <div className="hairline space-y-4 border bg-white/40 p-6 text-base leading-relaxed">
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        if (SCENE_HEADING_PATTERN.test(trimmed)) {
          return (
            <p key={i} className="text-xs font-semibold uppercase tracking-[0.15em] opacity-70">
              {trimmed}
            </p>
          );
        }

        if (CUE_PATTERN.test(trimmed)) {
          return (
            <p key={i} className="text-sm font-semibold uppercase tracking-widest opacity-80">
              {trimmed}
            </p>
          );
        }

        return (
          <p key={i} className="whitespace-pre-line opacity-90">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
