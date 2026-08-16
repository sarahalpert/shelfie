"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MediaItemData, MediaType } from "@/lib/media/types";

const FILTERS: { label: string; value: MediaType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Books", value: "book" },
  { label: "Films", value: "movie" },
  { label: "Series", value: "tv" },
];

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
      className="bg-card flex gap-4 rounded-2xl p-3 transition-colors hover:bg-accent"
    >
      <div className="bg-muted h-24 w-16 shrink-0 overflow-hidden rounded-lg">
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
        <span className="text-primary text-xs font-medium uppercase">
          {item.type}
        </span>
        <span className="font-medium leading-tight">{item.title}</span>
        {item.year && (
          <span className="text-muted-foreground text-sm">{item.year}</span>
        )}
      </div>
    </Link>
  );
}

export function SearchResults({
  results,
  query,
}: {
  results: MediaItemData[];
  query: string;
}) {
  const [filter, setFilter] = useState<MediaType | "all">("all");

  const filtered =
    filter === "all" ? results : results.filter((r) => r.type === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {query.length > 0 && filtered.length === 0 && (
        <p className="text-muted-foreground">
          No results for &quot;{query}&quot;.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((item) => (
          <ResultCard
            key={`${item.externalSource}-${item.externalId}`}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}
