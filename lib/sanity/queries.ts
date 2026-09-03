import type { PortableTextBlock } from "next-sanity";
import { client } from "./client";
import { urlFor } from "./image";
import { placeholderCover } from "@/lib/placeholder";

export type { PortableTextBlock };

// Revalidation tags — one per document type, matching the _type the publish webhook
// receives so `revalidateTag(_type)` invalidates exactly the queries that used it.
const TAGS = {
  series: ["series"],
  character: ["character"],
  episode: ["episode"],
  artist: ["artist"],
  teamMember: ["teamMember"],
} as const;

function fetchTagged<T>(query: string, tags: readonly string[], params: Record<string, unknown> = {}) {
  return client.fetch<T>(query, params, { next: { tags: [...tags] } });
}

// ---------------------------------------------------------------------------
// Series
// ---------------------------------------------------------------------------

export interface Series {
  title: string;
  titleZh: string;
  tagline: string;
  openingQuote: PortableTextBlock[];
  synopsisEn: PortableTextBlock[];
  synopsisZh: PortableTextBlock[];
}

const SERIES_QUERY = /* groq */ `*[_type == "series"][0]{
  title,
  titleZh,
  tagline,
  openingQuote,
  synopsisEn,
  synopsisZh
}`;

export async function getSeries(): Promise<Series | undefined> {
  const doc = await fetchTagged<Series | null>(SERIES_QUERY, TAGS.series);
  return doc ?? undefined;
}

// ---------------------------------------------------------------------------
// Artists
// ---------------------------------------------------------------------------

export interface Artist {
  id: string; // slug
  name: string;
  role: string;
  studio?: string;
  location?: string;
  bio: string;
  galleryPriceId?: string;
}

const ARTIST_PROJECTION = /* groq */ `{
  "id": slug.current,
  name,
  role,
  studio,
  location,
  bio,
  galleryPriceId
}`;

export async function getArtists(): Promise<Artist[]> {
  return fetchTagged<Artist[]>(`*[_type == "artist"] | order(name asc) ${ARTIST_PROJECTION}`, TAGS.artist);
}

export async function getArtistById(id: string): Promise<Artist | undefined> {
  const doc = await fetchTagged<Artist | null>(
    `*[_type == "artist" && slug.current == $id][0] ${ARTIST_PROJECTION}`,
    TAGS.artist,
    { id }
  );
  return doc ?? undefined;
}

// ---------------------------------------------------------------------------
// Characters
// ---------------------------------------------------------------------------

export interface Artwork {
  imageUrl: string;
  artistId: string;
  artistName: string;
  isPrimary?: boolean;
  isFreeSample?: boolean;
}

export interface Character {
  id: string; // slug
  name: string;
  originalName?: string;
  meaning?: string;
  bio: string;
  primaryColor?: string;
  secondaryColor?: string;
  group: "academy" | "extended";
  artworks: Artwork[];
}

// Curated display order, preserved from the original hand-ordered content —
// Sanity has no reliable stable order otherwise.
const CHARACTER_ORDER = [
  "zhang-enlian", "fang-yimeng", "didi", "liyuehua", "yisu", "caiying", "jie-jie",
  "an-mang", "hui-xia", "gongshun", "liu-fan", "liu-fu", "qiaoxin", "jian-yao",
  "meng-an", "ai-lin", "liyuejin",
  "zhang-xuan-hui", "zhang-ling-hui", "zhang-qingnian", "wang-ziyuan", "zena",
  "fang-zhiyuan", "fang-wenhao", "yixuan",
];

function sortByCharacterOrder<T extends { id: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => CHARACTER_ORDER.indexOf(a.id) - CHARACTER_ORDER.indexOf(b.id)
  );
}

interface RawCharacter {
  id: string;
  name: string;
  originalName?: string;
  meaning?: string;
  bio: string;
  primaryColor?: string;
  secondaryColor?: string;
  group: "academy" | "extended";
  artworks: {
    _key: string;
    isPrimary?: boolean;
    isFreeSample?: boolean;
    image: { asset?: { _ref: string } } | null;
    artistId: string | null;
    artistName: string | null;
  }[];
}

const CHARACTER_PROJECTION = /* groq */ `{
  "id": slug.current,
  name,
  originalName,
  meaning,
  bio,
  primaryColor,
  secondaryColor,
  group,
  artworks[]{
    _key,
    isPrimary,
    isFreeSample,
    image,
    "artistId": artist->slug.current,
    "artistName": artist->name
  }
}`;

function resolveArtworks(raw: RawCharacter["artworks"]): Artwork[] {
  return raw
    .filter((a) => a.image?.asset && a.artistId && a.artistName)
    .map((a) => ({
      imageUrl: urlFor(a.image!).width(800).height(800).fit("crop").url(),
      artistId: a.artistId!,
      artistName: a.artistName!,
      isPrimary: a.isPrimary,
      isFreeSample: a.isFreeSample,
    }));
}

export async function getCharacters(): Promise<Character[]> {
  const raw = await fetchTagged<RawCharacter[]>(`*[_type == "character"] ${CHARACTER_PROJECTION}`, TAGS.character);
  const characters = raw.map((c) => ({ ...c, artworks: resolveArtworks(c.artworks) }));
  return sortByCharacterOrder(characters);
}

export async function getCharacterById(id: string): Promise<Character | undefined> {
  const raw = await fetchTagged<RawCharacter | null>(
    `*[_type == "character" && slug.current == $id][0] ${CHARACTER_PROJECTION}`,
    TAGS.character,
    { id }
  );
  if (!raw) return undefined;
  return { ...raw, artworks: resolveArtworks(raw.artworks) };
}

export async function getCharactersByGroup(group: Character["group"]): Promise<Character[]> {
  const all = await getCharacters();
  return all.filter((c) => c.group === group);
}

export async function getCharactersByArtist(artistId: string): Promise<Character[]> {
  const all = await getCharacters();
  return all.filter((c) => c.artworks.some((a) => a.artistId === artistId));
}

export function getPrimaryArtwork(character: Character): Artwork | undefined {
  return character.artworks.find((a) => a.isPrimary) ?? character.artworks[0];
}

// ---------------------------------------------------------------------------
// Episodes
// ---------------------------------------------------------------------------

export interface EpisodeContentEntry {
  available: boolean;
  body?: string;
}

export interface EpisodeContent {
  synopsis?: EpisodeContentEntry;
  sneakPeek?: EpisodeContentEntry;
  fullScript?: EpisodeContentEntry;
  storyboard?: { available: boolean };
  fullEpisode?: { available: boolean; videoPath?: string };
}

export interface Episode {
  id: string; // slug
  number: number;
  title: string;
  teaser?: string;
  coverImageUrl: string;
  priceId?: string;
  content: EpisodeContent;
}

interface RawEpisode {
  id: string;
  number: number;
  title: string;
  teaser?: string;
  coverImage: { asset?: { _ref: string } } | null;
  priceId?: string;
  content: EpisodeContent;
}

const EPISODE_PROJECTION = /* groq */ `{
  "id": slug.current,
  number,
  title,
  teaser,
  coverImage,
  priceId,
  content
}`;

function resolveEpisode(raw: RawEpisode): Episode {
  return {
    id: raw.id,
    number: raw.number,
    title: raw.title,
    teaser: raw.teaser,
    coverImageUrl: raw.coverImage?.asset
      ? urlFor(raw.coverImage).width(800).height(500).fit("crop").url()
      : placeholderCover(raw.title),
    priceId: raw.priceId,
    content: raw.content,
  };
}

export async function getEpisodes(): Promise<Episode[]> {
  const raw = await fetchTagged<RawEpisode[]>(
    `*[_type == "episode"] | order(number asc) ${EPISODE_PROJECTION}`,
    TAGS.episode
  );
  return raw.map(resolveEpisode);
}

export async function getEpisodeById(id: string): Promise<Episode | undefined> {
  const raw = await fetchTagged<RawEpisode | null>(
    `*[_type == "episode" && slug.current == $id][0] ${EPISODE_PROJECTION}`,
    TAGS.episode,
    { id }
  );
  return raw ? resolveEpisode(raw) : undefined;
}

/** The 5 content categories shown in the episode overlay, in display order. */
export const EPISODE_CATEGORIES: {
  key: keyof EpisodeContent;
  label: string;
  free: boolean;
}[] = [
  { key: "synopsis", label: "Synopsis", free: true },
  { key: "sneakPeek", label: "Sneak Peek", free: false },
  { key: "fullScript", label: "Full Script", free: false },
  { key: "storyboard", label: "Storyboard", free: false },
  { key: "fullEpisode", label: "Full Episode", free: false },
];

export function episodeHasAvailableContent(episode: Episode): boolean {
  return EPISODE_CATEGORIES.some((c) => episode.content[c.key]?.available);
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export interface TeamMember {
  id: string;
  name: string;
  nameZh?: string;
  role: string;
  bio: string;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return fetchTagged<TeamMember[]>(
    `*[_type == "teamMember"]{ "id": _id, name, nameZh, role, bio }`,
    TAGS.teamMember
  );
}

// ---------------------------------------------------------------------------
// Home page background pool (item 5) — every character concept-art image,
// deduped by asset id since a few pieces are shared across characters.
// ---------------------------------------------------------------------------

export interface ConceptArtImage {
  url: string;
}

interface RawArtworkImage {
  asset?: { _ref: string };
}

export async function getConceptArtPool(): Promise<ConceptArtImage[]> {
  const images = await fetchTagged<RawArtworkImage[]>(
    `*[_type == "character"].artworks[].image`,
    TAGS.character
  );

  const seen = new Set<string>();
  const pool: ConceptArtImage[] = [];
  for (const image of images) {
    const ref = image?.asset?._ref;
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    pool.push({ url: urlFor(image).width(600).height(900).fit("crop").auto("format").url() });
  }
  return pool;
}
