import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTeamMembers, getArtists } from "@/lib/content";
import { getLocale, pick } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Team · The Hidden Gospel",
};

export default async function TeamPage() {
  const [team, artists, locale] = await Promise.all([
    getTeamMembers(),
    getArtists(),
    getLocale(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-serif-display)] text-4xl">Team</h1>

      <section className="mt-10 space-y-6">
        {team.map((member) => (
          <div key={member.id} className="hairline flex flex-col gap-6 border p-6 sm:flex-row">
            {member.photoUrl && (
              <Image
                src={member.photoUrl}
                alt={member.name}
                width={160}
                height={160}
                className="h-40 w-40 shrink-0 self-center object-cover sm:self-start"
              />
            )}
            <div>
              <p className="font-[family-name:var(--font-serif-display)] text-lg">
                {pick(locale, member.name, member.nameZh)}
                {member.nameZh && (
                  <span className="ml-2 text-sm opacity-60">
                    {locale === "en" ? member.nameZh : member.name}
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm opacity-80">{member.role}</p>
              {member.bio && (
                <p className="mt-4 text-base leading-relaxed opacity-90">{member.bio}</p>
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="hairline my-12 border-t" />

      <h2 className="text-sm uppercase tracking-widest opacity-60">Artists</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {artists.map((artist) => (
          <Link
            key={artist.id}
            href={`/artists/${artist.id}`}
            className="hairline flex flex-col gap-2 border p-6 transition-colors hover:bg-white/40 focus-visible:outline-2 focus-visible:outline-ink"
          >
            <p className="font-[family-name:var(--font-serif-display)] text-lg">
              {artist.name}
            </p>
            <p className="text-sm opacity-80">{artist.role}</p>
            {artist.studio && <p className="text-xs opacity-60">{artist.studio}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
