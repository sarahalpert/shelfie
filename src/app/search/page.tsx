import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchBooks } from "@/lib/media/openlibrary";
import { searchMoviesAndTv } from "@/lib/media/tmdb";
import { SearchResults } from "@/components/search-results";

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
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-5">
      <h1 className="font-heading text-2xl font-bold">Search</h1>

      <form className="flex gap-2">
        <Input
          type="text"
          name="q"
          placeholder="Search books, films, series..."
          defaultValue={query}
          autoFocus
          className="rounded-full"
        />
        <Button type="submit" className="rounded-full">
          Search
        </Button>
      </form>

      <SearchResults results={results} query={query} />
    </div>
  );
}
