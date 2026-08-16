import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchBooks } from "@/lib/media/openlibrary";
import { searchMoviesAndTv } from "@/lib/media/tmdb";
import { MediaItemData } from "@/lib/media/types";

function detailHref(item: MediaItemData): string {
  if (item.type !== "book") {
    return `/media/${item.type}/${item.externalId}`;
  }

  const params = new URLSearchParams({ title: item.title });
  if (item.year) params.set("year", String(item.year));
  if (item.imageUrl) params.set("image", item.imageUrl);
  const authors = item.metadata.authors as string[] | undefined;
  if (authors?.length) params.set("authors", authors.join(", "));

  return `/media/book/${item.externalId}?${params.toString()}`;
}

function ResultCard({ item }: { item: MediaItemData }) {
  return (
    <Link
      href={detailHref(item)}
      className="flex gap-4 rounded-lg border p-3 transition-colors hover:bg-accent"
    >
      <div className="bg-muted h-24 w-16 shrink-0 overflow-hidden rounded">
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={64}
            height={96}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          {item.type}
        </span>
        <span className="font-medium leading-tight">{item.title}</span>
        {item.year && (
          <span className="text-sm text-muted-foreground">{item.year}</span>
        )}
      </div>
    </Link>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const results =
    query.length > 0
      ? (
          await Promise.all([searchBooks(query), searchMoviesAndTv(query)])
        ).flat()
      : [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>

      <form className="flex gap-2">
        <Input
          type="text"
          name="q"
          placeholder="Search books, movies, and TV..."
          defaultValue={query}
          autoFocus
        />
        <Button type="submit">Search</Button>
      </form>

      {query.length > 0 && results.length === 0 && (
        <p className="text-muted-foreground">No results for &quot;{query}&quot;.</p>
      )}

      <div className="flex flex-col gap-2">
        {results.map((item) => (
          <ResultCard
            key={`${item.externalSource}-${item.externalId}`}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}
