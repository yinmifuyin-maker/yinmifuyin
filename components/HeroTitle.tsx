import HoverReveal from "./HoverReveal";

export default function HeroTitle({
  titleZh,
  title,
}: {
  titleZh?: string;
  title?: string;
}) {
  return (
    <HoverReveal
      className="inline-flex items-center justify-center"
      base={
        <h1 className="font-[family-name:var(--font-calligraphy)] text-6xl leading-none sm:text-8xl">
          {titleZh}
        </h1>
      }
      reveal={
        <p className="whitespace-nowrap font-[family-name:var(--font-serif-display)] text-3xl sm:text-5xl">
          {title}
        </p>
      }
    />
  );
}
