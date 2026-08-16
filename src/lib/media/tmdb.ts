import { fetchWithRetry } from "./fetch-with-retry";
import { MediaItemData, MediaType } from "./types";

const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

type TmdbMovie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  overview?: string;
};

type TmdbTv = {
  id: number;
  name: string;
  first_air_date?: string;
  poster_path?: string | null;
  overview?: string;
};

function yearFromDate(date: string | undefined): number | null {
  if (!date) return null;
  const year = Number(date.slice(0, 4));
  return Number.isNaN(year) ? null : year;
}

function posterUrl(path: string | null | undefined): string | null {
  return path ? `${IMAGE_BASE}${path}` : null;
}

async function tmdbFetch<T>(path: string): Promise<T | null> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) return null;

  try {
    const res = await fetchWithRetry(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    return (await res.json()) as T;
  } catch (error) {
    console.error("TMDB request failed:", error);
    return null;
  }
}

function movieToMediaItem(movie: TmdbMovie): MediaItemData {
  return {
    type: "movie",
    externalSource: "tmdb",
    externalId: String(movie.id),
    title: movie.title,
    year: yearFromDate(movie.release_date),
    imageUrl: posterUrl(movie.poster_path),
    metadata: { overview: movie.overview ?? "" },
  };
}

function tvToMediaItem(show: TmdbTv): MediaItemData {
  return {
    type: "tv",
    externalSource: "tmdb",
    externalId: String(show.id),
    title: show.name,
    year: yearFromDate(show.first_air_date),
    imageUrl: posterUrl(show.poster_path),
    metadata: { overview: show.overview ?? "" },
  };
}

export async function searchMoviesAndTv(
  query: string,
): Promise<MediaItemData[]> {
  const encoded = encodeURIComponent(query);

  const [movies, tv] = await Promise.all([
    tmdbFetch<{ results: TmdbMovie[] }>(
      `/search/movie?query=${encoded}&page=1`,
    ),
    tmdbFetch<{ results: TmdbTv[] }>(`/search/tv?query=${encoded}&page=1`),
  ]);

  return [
    ...(movies?.results ?? []).map(movieToMediaItem),
    ...(tv?.results ?? []).map(tvToMediaItem),
  ];
}

export async function getTmdbDetail(
  type: Extract<MediaType, "movie" | "tv">,
  externalId: string,
): Promise<MediaItemData | null> {
  if (type === "movie") {
    const movie = await tmdbFetch<TmdbMovie>(`/movie/${externalId}`);
    return movie ? movieToMediaItem(movie) : null;
  }

  const show = await tmdbFetch<TmdbTv>(`/tv/${externalId}`);
  return show ? tvToMediaItem(show) : null;
}
