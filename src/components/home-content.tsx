"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FILTERS, type FilterValue } from "@/lib/media/filters";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";
import { FeedCard, type FeedEntry } from "@/components/feed-card";
import { Logo } from "@/components/logo";
import type { MediaItemData } from "@/lib/media/types";
import type { PersonResult } from "@/components/people-results";

export function HomeContent({
  query,
  searchResults,
  people,
  isLoggedIn,
  feedEntries,
}: {
  query: string;
  searchResults: MediaItemData[];
  people: PersonResult[];
  isLoggedIn: boolean;
  feedEntries: FeedEntry[];
}) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const isSearchMode = query.length > 0;

  const filteredFeed =
    filter === "all"
      ? feedEntries
      : filter === "people"
        ? []
        : feedEntries.filter((e) => e.media_item.type === filter);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-5">
      <SearchBar defaultValue={query} />

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

      {isSearchMode ? (
        <SearchResults
          results={searchResults}
          people={people}
          isLoggedIn={isLoggedIn}
          query={query}
          filter={filter}
        />
      ) : filter === "people" ? (
        <p className="text-muted-foreground">
          Type a name above to search for people.
        </p>
      ) : !isLoggedIn ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Logo size="lg" />
          <p className="text-muted-foreground max-w-xs">
            Rate and discuss books, movies, and TV with your friends.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredFeed.length === 0 && (
            <p className="text-muted-foreground">
              Follow people to see what they&apos;re logging here, or search
              above for something to log yourself.
            </p>
          )}
          {filteredFeed.map((entry) => (
            <FeedCard key={entry.id} entry={entry} showAddToShelf />
          ))}
        </div>
      )}
    </div>
  );
}
