// Content layer — backed by Sanity. Every page pulls its content through the
// getters re-exported here, so page/component code never talks to the Sanity
// client directly. See lib/sanity/queries.ts for the actual GROQ queries.
export type {
  Series,
  Artwork,
  Character,
  EpisodeContentEntry,
  EpisodeContent,
  Episode,
  Artist,
  TeamMember,
  ConceptArtImage,
} from "./sanity/queries";

export {
  getSeries,
  getArtists,
  getArtistById,
  getCharacters,
  getCharacterById,
  getCharactersByGroup,
  getCharactersByArtist,
  getPrimaryArtwork,
  getEpisodes,
  getEpisodeById,
  EPISODE_CATEGORIES,
  episodeHasAvailableContent,
  getTeamMembers,
  getConceptArtPool,
} from "./sanity/queries";
