import type { PortableTextBlock } from "next-sanity";
import { client } from "./client";
import { urlFor } from "./image";
import type { SanityImageSource } from "@sanity/image-url";
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
  useOfProceeds: ["useOfProceeds"],
  homeFigures: ["homeFigures"],
  shortStory: ["shortStory"],
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

/** A sketch video on an artist's page. Blob paths stay server-side (see getSketchVideoPaths). */
export interface SketchVideo {
  key: string; // the array item's _key, which the upload script sets
  title: string;
  hasPreview: boolean;
}

export interface Artist {
  id: string; // slug
  name: string;
  role: string;
  studio?: string;
  location?: string;
  bio: string;
  galleryPriceId?: string;
  sketchVideos: SketchVideo[];
}

// Only sketches switched on in Studio, with a title and an uploaded video, reach the site.
const ARTIST_PROJECTION = /* groq */ `{
  "id": slug.current,
  name,
  role,
  studio,
  location,
  bio,
  galleryPriceId,
  "sketchVideos": coalesce(
    sketchVideos[available == true && defined(title) && defined(videoPath)]{
      "key": _key,
      title,
      "hasPreview": defined(previewPath)
    },
    []
  )
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

export async function getSketchVideoPaths(
  artistId: string,
  sketchKey: string
): Promise<{ videoPath: string; previewPath?: string } | undefined> {
  const doc = await fetchTagged<{ videoPath: string; previewPath?: string } | null>(
    `*[_type == "artist" && slug.current == $artistId][0].sketchVideos[
      _key == $sketchKey && available == true && defined(title) && defined(videoPath)
    ][0]{ videoPath, previewPath }`,
    TAGS.artist,
    { artistId, sketchKey }
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
  storyboard?: {
    available: boolean;
    videoPath?: string;
    previewPath?: string;
    artistName?: string;
    artistId?: string;
  };
  fullEpisode?: { available: boolean; videoPath?: string };
}

export interface Episode {
  id: string; // slug
  number: number;
  title: string;
  teaser?: string;
  coverImageUrl: string;
  // False while coverImageUrl is only the labelled placeholder.
  hasCoverImage: boolean;
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
  content{
    ...,
    storyboard{
      ...,
      "artistName": artist->name,
      "artistId": artist->slug.current
    }
  }
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
    hasCoverImage: Boolean(raw.coverImage?.asset),
    priceId: raw.priceId,
    content: raw.content,
  };
}

export async function getEpisodes(): Promise<Episode[]> {
  const raw = await fetchTagged<RawEpisode[]>(
    `*[_type == "episode"] | order(number asc) ${EPISODE_PROJECTION}`,
    [...TAGS.episode, ...TAGS.artist]
  );
  return raw.map(resolveEpisode);
}

export async function getEpisodeById(id: string): Promise<Episode | undefined> {
  const raw = await fetchTagged<RawEpisode | null>(
    `*[_type == "episode" && slug.current == $id][0] ${EPISODE_PROJECTION}`,
    [...TAGS.episode, ...TAGS.artist],
    { id }
  );
  return raw ? resolveEpisode(raw) : undefined;
}

export interface FeaturedStoryboard {
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  artistName?: string;
  artistId?: string;
}

/** The storyboard video switched on for the home page, if any (lowest episode number wins). */
export async function getFeaturedStoryboard(): Promise<FeaturedStoryboard | undefined> {
  const doc = await fetchTagged<FeaturedStoryboard | null>(
    `*[_type == "episode"
      && content.storyboard.featureOnHome == true
      && content.storyboard.available == true
      && defined(content.storyboard.videoPath)
    ] | order(number asc)[0]{
      "episodeId": slug.current,
      "episodeNumber": number,
      "episodeTitle": title,
      "artistName": content.storyboard.artist->name,
      "artistId": content.storyboard.artist->slug.current
    }`,
    // The artist's name comes from the artist document, so its edits must refresh this too.
    [...TAGS.episode, ...TAGS.artist]
  );
  return doc ?? undefined;
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
// Short stories ("Hidden Shorts") — scrolls on the Episodes timeline. Both
// texts are free; only whether each is available reaches the page, and the
// text itself is fetched when opened (see /api/short-story-content).
// ---------------------------------------------------------------------------

export const SHORT_STORY_PARTS = [
  { key: "synopsis", label: "Synopsis" },
  { key: "story", label: "Short Story" },
] as const;

export type ShortStoryPart = (typeof SHORT_STORY_PARTS)[number]["key"];

export interface ShortStory {
  id: string; // slug
  title: string;
  note?: string;
  available: Record<ShortStoryPart, boolean>;
}

export async function getShortStories(): Promise<ShortStory[]> {
  return fetchTagged<ShortStory[]>(
    `*[_type == "shortStory" && defined(slug.current)] | order(title asc){
      "id": slug.current,
      title,
      note,
      "available": {
        "synopsis": synopsis.available == true && defined(synopsis.body),
        "story": story.available == true && defined(story.body)
      }
    }`,
    TAGS.shortStory
  );
}

export async function getShortStoryText(id: string, part: ShortStoryPart): Promise<string | undefined> {
  type Entry = { available?: boolean; body?: string } | null;
  const doc = await fetchTagged<Record<ShortStoryPart, Entry> | null>(
    `*[_type == "shortStory" && slug.current == $id][0]{ synopsis, story }`,
    TAGS.shortStory,
    { id }
  );
  const entry = doc?.[part];
  return entry?.available ? entry.body : undefined;
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export interface TeamMember {
  id: string;
  name: string;
  nameZh?: string;
  role: string;
  bio?: string;
  photoUrl?: string;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const raw = await fetchTagged<(Omit<TeamMember, "photoUrl"> & { photo?: SanityImageSource })[]>(
    `*[_type == "teamMember"] | order(_createdAt asc){ "id": _id, name, nameZh, role, bio, photo }`,
    TAGS.teamMember
  );
  return raw.map(({ photo, ...m }) => ({
    ...m,
    photoUrl: photo
      ? urlFor(photo).width(480).height(480).fit("crop").auto("format").url()
      : undefined,
  }));
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

// ---------------------------------------------------------------------------
// Use of Proceeds
// ---------------------------------------------------------------------------

export interface UseOfProceedsPhaseWithGoal {
  title: string;
  goalAmountUSD?: number;
  goalDisclaimer?: string;
  description?: string;
}

export interface UseOfProceedsPhaseWithStatus {
  title: string;
  goalStatus?: string;
  description?: string;
}

export interface UseOfProceeds {
  title: string;
  lastUpdatedNote?: string;
  intro?: string;
  transparencyNote?: string;
  splitExplanation?: string;
  phase1?: UseOfProceedsPhaseWithGoal;
  phase2?: UseOfProceedsPhaseWithStatus;
  phase3?: UseOfProceedsPhaseWithStatus;
  episodeUnlockNote?: string;
}

const USE_OF_PROCEEDS_QUERY = /* groq */ `*[_type == "useOfProceeds"][0]{
  title,
  lastUpdatedNote,
  intro,
  transparencyNote,
  splitExplanation,
  phase1,
  phase2,
  phase3,
  episodeUnlockNote
}`;

export async function getUseOfProceeds(): Promise<UseOfProceeds | undefined> {
  const doc = await fetchTagged<UseOfProceeds | null>(USE_OF_PROCEEDS_QUERY, TAGS.useOfProceeds);
  return doc ?? undefined;
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

/**
 * One artist's character art, for faded page backdrops (the Episodes page uses
 * Michael Carelse's). Deduped by asset, in a stable order so server renders match.
 */
export async function getArtistArtPool(artistId: string): Promise<ConceptArtImage[]> {
  const images = await fetchTagged<RawArtworkImage[]>(
    `*[_type == "character"] | order(_id asc).artworks[artist->slug.current == $artistId].image`,
    [...TAGS.character, ...TAGS.artist],
    { artistId }
  );

  const seen = new Set<string>();
  const pool: ConceptArtImage[] = [];
  for (const image of images) {
    const ref = image?.asset?._ref;
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    pool.push({ url: urlFor(image).width(700).auto("format").quality(70).url() });
  }
  return pool;
}

// ---------------------------------------------------------------------------
// Home page character figures — full-body transparent character art that
// rotates down either side of the home page. Curated in the "homeFigures"
// singleton so the line-up can change without a deploy.
// ---------------------------------------------------------------------------

export interface HomeFigure {
  url: string;
  // Character name -- groups a character's colourways onto one side.
  name: string;
}

interface RawHomeFigure {
  name?: string;
  image?: { asset?: { _ref: string } } | null;
}

export async function getHomeFigures(): Promise<HomeFigure[]> {
  const raw = await fetchTagged<RawHomeFigure[] | null>(
    `*[_type == "homeFigures"][0].figures[]{ name, image }`,
    TAGS.homeFigures
  );

  return (raw ?? [])
    .filter((f) => f.image?.asset)
    .map((f) => ({
      // Figures render at most 56rem tall, so 1200px stays sharp on most
      // screens; auto("format") serves WebP/AVIF with the transparency intact.
      url: urlFor(f.image!).height(1200).auto("format").quality(80).url(),
      name: f.name ?? "",
    }));
}
