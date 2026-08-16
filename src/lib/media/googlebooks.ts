import { fetchWithRetry } from "./fetch-with-retry";
import { MediaItemData } from "./types";

const API_BASE = "https://www.googleapis.com/books/v1/volumes";

type GoogleBooksVolume = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

type GoogleBooksSearchResponse = {
  items?: GoogleBooksVolume[];
};

function yearFromDate(date: string | undefined): number | null {
  if (!date) return null;
  const year = Number(date.slice(0, 4));
  return Number.isNaN(year) ? null : year;
}

function secureImageUrl(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//, "https://");
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function toMediaItem(volume: GoogleBooksVolume): MediaItemData {
  const info = volume.volumeInfo ?? {};
  return {
    type: "book",
    externalSource: "googlebooks",
    externalId: volume.id,
    title: info.title ?? "Untitled",
    year: yearFromDate(info.publishedDate),
    imageUrl: secureImageUrl(info.imageLinks?.thumbnail),
    metadata: {
      authors: info.authors ?? [],
      overview: info.description ? stripHtml(info.description) : "",
    },
  };
}

export async function searchBooks(query: string): Promise<MediaItemData[]> {
  const url = new URL(API_BASE);
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "10");
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
  }

  try {
    const res = await fetchWithRetry(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data: GoogleBooksSearchResponse = await res.json();
    return (data.items ?? []).map(toMediaItem);
  } catch (error) {
    console.error("Google Books search failed:", error);
    return [];
  }
}

export async function getGoogleBooksDetail(
  volumeId: string,
): Promise<MediaItemData | null> {
  const url = new URL(`${API_BASE}/${volumeId}`);
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
  }

  try {
    const res = await fetchWithRetry(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const volume: GoogleBooksVolume = await res.json();
    return toMediaItem(volume);
  } catch (error) {
    console.error("Google Books detail fetch failed:", error);
    return null;
  }
}
