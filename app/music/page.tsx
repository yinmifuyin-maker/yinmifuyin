import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music · The Hidden Gospel",
};

export default function MusicPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-serif-display)] text-4xl">Music</h1>
      <p className="mt-10 font-[family-name:var(--font-serif-display)] text-2xl opacity-80">
        Coming soon!
      </p>
    </div>
  );
}
