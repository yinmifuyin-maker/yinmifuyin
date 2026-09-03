// Episode cover images have no real art yet (only character art has been shot/uploaded).
// This is kept deliberately separate from character rendering, which shows an honest
// "Art coming soon" empty state instead of a generated placeholder graphic -- episode
// covers are decorative card art rather than something a visitor expects to be real,
// so a labeled placeholder image is acceptable here.
//
// ".png" forces placehold.co to return a PNG instead of an SVG -- next/image's optimizer
// refuses SVGs by default, which otherwise breaks every placeholder image.
export function placeholderCover(label: string, w = 800, h = 500): string {
  return `https://placehold.co/${w}x${h}/EDE6D6/1C1A17.png?font=roboto&text=${encodeURIComponent(label)}`;
}
