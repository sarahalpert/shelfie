"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MediaItemData, MediaType } from "@/lib/media/types";
import { PersonRow, type PersonResult } from "@/components/people-results";

type FilterValue = MediaType | "all" | "people";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Books", value: "book" },
  { label: "Films", value: "movie" },
  { label: "Series", value: "tv" },
  { label: "People", value: "people" },
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
  people,
  isLoggedIn,
  query,
}: {
  results: MediaItemData[];
  people: PersonResult[];
  isLoggedIn: boolean;
  query: string;
}) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredMedia =
    filter === "people"
      ? []
      : filter === "all"
        ? results
        : results.filter((r) => r.type === filter);

  const showMedia = filter !== "people";
  const visiblePeople = filter === "all" || filter === "people" ? people : [];

  const nothingFound =
    query.length > 0 &&
    (filter === "people"
      ? visiblePeople.length === 0
      : filter === "all"
        ? visiblePeople.length === 0 && filteredMedia.length === 0
        : filteredMedia.length === 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {nothingFound && (
        <p className="text-muted-foreground">
          No results for &quot;{query}&quot;.
        </p>
      )}

      {visiblePeople.length > 0 && (
        <div className="flex flex-col gap-2">
          {filter === "all" && (
            <h2 className="text-muted-foreground text-xs font-medium uppercase">
              People
            </h2>
          )}
          {visiblePeople.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}

      {showMedia && (
        <div className="flex flex-col gap-2">
          {filteredMedia.map((item) => (
            <ResultCard
              key={`${item.externalSource}-${item.externalId}`}
              item={item}
            />
          ))}
        </div>
      )}
    </div>
  );
}
