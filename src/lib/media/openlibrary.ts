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

  try {
    const res = await fetchWithRetry(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data: OpenLibrarySearchResponse = await res.json();
    return data.docs.map(toMediaItem);
  } catch (error) {
    console.error("Open Library search failed:", error);
    return [];
  }
}

type OpenLibraryWork = {
  title: string;
  description?: string | { value: string };
  covers?: number[];
  first_publish_date?: string;
  authors?: { author?: { key: string } }[];
};

type OpenLibraryAuthor = {
  name?: string;
};

function yearFromString(date: string | undefined): number | null {
  if (!date) return null;
  const match = date.match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

export async function getOpenLibraryDetail(
  workId: string,
): Promise<MediaItemData | null> {
  try {
    const res = await fetchWithRetry(
      `https://openlibrary.org/works/${workId}.json`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;

    const work: OpenLibraryWork = await res.json();

    const authorKeys = (work.authors ?? [])
      .map((a) => a.author?.key)
      .filter((key): key is string => Boolean(key));

    const authorNames = await Promise.all(
      authorKeys.map(async (key) => {
        try {
          const authorRes = await fetchWithRetry(
            `https://openlibrary.org${key}.json`,
            { next: { revalidate: 3600 } },
          );
          if (!authorRes.ok) return null;
          const author: OpenLibraryAuthor = await authorRes.json();
          return author.name ?? null;
        } catch {
          return null;
        }
      }),
    );

    const overview =
      typeof work.description === "string"
        ? work.description
        : (work.description?.value ?? "");

    return {
      type: "book",
      externalSource: "openlibrary",
      externalId: workId,
      title: work.title,
      year: yearFromString(work.first_publish_date),
      imageUrl: coverUrl(work.covers?.[0]),
      metadata: {
        authors: authorNames.filter((n): n is string => Boolean(n)),
        overview,
      },
    };
  } catch (error) {
    console.error("Open Library detail fetch failed:", error);
    return null;
  }
}
