export type MediaType = "book" | "movie" | "tv";
export type ExternalSource = "tmdb" | "openlibrary";

export type MediaItemData = {
  type: MediaType;
  externalSource: ExternalSource;
  externalId: string;
  title: string;
  year: number | null;
  imageUrl: string | null;
  metadata: Record<string, unknown>;
};
