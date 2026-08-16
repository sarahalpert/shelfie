import { fetchWithRetry } from "./fetch-with-retry";
import { MediaItemData } from "./types";

type OpenLibraryDoc = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
};

type OpenLibrarySearchResponse = {
  docs: OpenLibraryDoc[];
};

function coverUrl(coverId: number | undefined): string | null {
  return coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : null;
}

function toMediaItem(doc: OpenLibraryDoc): MediaItemData {
  return {
    type: "book",
    externalSource: "openlibrary",
    externalId: doc.key.replace("/works/", ""),
    title: doc.title,
    year: doc.first_publish_year ?? null,
    imageUrl: coverUrl(doc.cover_i),
    metadata: {
      authors: doc.author_name ?? [],
    },
  };
}

export async function searchBooks(query: string): Promise<MediaItemData[]> {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "10");
  url.searchParams.set(
    "fields",
    "key,title,author_name,first_publish_year,cover_i",
  );

  const res = await fetchWithRetry(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data: OpenLibrarySearchResponse = await res.json();
  return data.docs.map(toMediaItem);
}
