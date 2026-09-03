import { PortableText, type PortableTextComponents } from "next-sanity";
import type { PortableTextBlock } from "@/lib/sanity/queries";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="font-[family-name:var(--font-serif-display)] text-base leading-relaxed text-ink sm:text-lg">
        {children}
      </p>
    ),
  },
  marks: {
    em: ({ children }) => <em className="italic">{children}</em>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  },
};

/**
 * Renders Sanity Portable Text as plain prose matching the site's serif/ink typography --
 * deliberately no card/box treatment, so italics and structure authored in the CMS carry
 * through directly (used for the series synopsis and short pull-quotes like the opening quote).
 */
export default function PortableProse({
  value,
  className = "",
}: {
  value: PortableTextBlock[] | undefined;
  className?: string;
}) {
  if (!value || value.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      <PortableText value={value} components={components} />
    </div>
  );
}
