import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story · The Hidden Gospel",
};

export default function OurStoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-serif-display)] text-4xl">Our Story</h1>

      <div className="mt-8 space-y-6 text-base leading-relaxed opacity-90">
        <p>Hello everyone! Welcome to The Hidden Gospel.</p>
        <p>
          We are a small team with a big dream. The Hidden Gospel is the culmination of a
          vision that spans four continents — the US, Europe, and Africa — bringing together
          artists, writers, and creatives from diverse cultures to tell a story unlike any
          other: a human-made Tang Dynasty DongHua where art, history, and culture intertwine
          in a story that redefines true love.
        </p>
        <p>
          Through rich world-building and unforgettable characters, we explore themes of
          identity, purpose, and human worth, examining ancient philosophies alongside the
          moral questions that continue to shape our world today.
        </p>
        <p>
          This is more than a graphic novel. It is a celebration of cultural exchange,
          timeless storytelling, and the belief that great stories can build bridges between
          people.
        </p>
      </div>

      <div className="hairline my-12 border-t" />

      <h2 className="font-[family-name:var(--font-serif-display)] text-2xl">
        Why We&rsquo;re Building This
      </h2>
      <div className="mt-6 space-y-6 text-base leading-relaxed opacity-90">
        <p>
          Your support enables our artists and writers to continue developing storyboards,
          character designs, promotional artwork, and the first chapters of the story. Every
          contribution helps transform ideas into tangible pages and brings this world one
          step closer to reality.
        </p>
        <p>
          This is only the beginning. As the project grows, we&rsquo;ll expand our creative
          team, develop exclusive merchandise, and prepare special rewards for the community
          helping bring The Hidden Gospel to life.
        </p>
        <p>
          Thank you for believing in our vision and for joining us at the very beginning of
          this journey. 回头见！
        </p>
      </div>

      <div className="hairline mt-12 border p-6 text-sm leading-relaxed opacity-80">
        As this project is in its startup phase, our artists and writers are currently
        contributing on a volunteer basis while supporting themselves through full-time work
        and other professional commitments. Development is carefully balanced alongside these
        responsibilities, with each team member dedicating their available time and expertise
        to bringing the project to life.
      </div>
    </div>
  );
}
