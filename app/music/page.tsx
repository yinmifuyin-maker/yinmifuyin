import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Music · The Hidden Gospel",
};

export default function MusicPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-serif-display)] text-4xl">Music</h1>
      <ComingSoon variant="box" className="mt-10 aspect-[16/9] w-full" />
    </div>
  );
}
