import type { Metadata } from "next";
import { getSeries } from "@/lib/content";
import DonateButton from "@/components/DonateButton";
import PortableProse from "@/components/PortableProse";

export const metadata: Metadata = {
  title: "Support · The Hidden Gospel",
};

export default async function SupportPage() {
  const series = await getSeries();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="font-[family-name:var(--font-serif-display)] text-4xl">
        Support the Project
      </h1>
      <p className="mt-6 text-base leading-relaxed opacity-90">
        The Hidden Gospel is being built by a small, volunteer team spread across four
        continents. Every contribution — however small — goes directly toward storyboards,
        character designs, promotional artwork, and the first chapters of the story.
      </p>
      {series?.openingQuote && (
        <PortableProse value={series.openingQuote} className="mt-4 opacity-90" />
      )}

      <p className="mt-6 text-sm opacity-70">
        Have a question before donating?{" "}
        <a
          href="mailto:yinmifuyin@gmail.com"
          className="underline underline-offset-2 opacity-90 hover:opacity-100"
        >
          yinmifuyin@gmail.com
        </a>
      </p>

      <div className="mt-10">
        <DonateButton />
      </div>

      <p className="mt-6 text-xs opacity-60">
        Donations are processed securely through Stripe.
      </p>
    </div>
  );
}
