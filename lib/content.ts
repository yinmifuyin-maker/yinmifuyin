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
  SketchVideo,
  FeaturedStoryboard,
  TeamMember,
  ConceptArtImage,
  HomeFigure,
  UseOfProceeds,
  UseOfProceedsPhaseWithGoal,
  UseOfProceedsPhaseWithStatus,
} from "./sanity/queries";

export {
  getSeries,
  getArtists,
  getArtistById,
  getSketchVideoPaths,
  getCharacters,
  getCharacterById,
  getCharactersByGroup,
  getCharactersByArtist,
  getPrimaryArtwork,
  getHomeFigures,
  getEpisodes,
  getEpisodeById,
  getFeaturedStoryboard,
  EPISODE_CATEGORIES,
  episodeHasAvailableContent,
  getTeamMembers,
  getConceptArtPool,
  getUseOfProceeds,
} from "./sanity/queries";
