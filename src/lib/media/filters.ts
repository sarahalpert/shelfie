import type { MediaType } from "./types";

export type FilterValue = MediaType | "all" | "people";

export const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Books", value: "book" },
  { label: "Films", value: "movie" },
  { label: "Series", value: "tv" },
  { label: "People", value: "people" },
];
