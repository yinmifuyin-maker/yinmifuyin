const NAMED_COLORS: Record<string, string> = {
  "#a9c4d4": "Powder Blue",
  "#c7b8d6": "Lilac",
  "#e3b8b0": "Blush Pink",
  "#1c1a17": "Ink Black",
  "#b08d57": "Brass",
};

function labelFor(hex: string) {
  return NAMED_COLORS[hex.toLowerCase()] ?? hex.toUpperCase();
}

export default function ColorSwatch({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="h-3 w-3 shrink-0 rounded-full ring-1 ring-ink/20"
        style={{ backgroundColor: color }}
      />
      <span aria-hidden className="h-px w-6 bg-ink/25" />
      <span className="text-xs tracking-wide opacity-80">
        {label}: {labelFor(color)}
      </span>
    </div>
  );
}
