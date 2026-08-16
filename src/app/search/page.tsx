import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchBooks } from "@/lib/media/openlibrary";
import { searchMoviesAndTv } from "@/lib/media/tmdb";
import { SearchResults } from "@/components/search-results";
import { PeopleResults, type PersonResult } from "@/components/people-results";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let people: PersonResult[] = [];
  if (query.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .ilike("username", `%${query}%`)
      .limit(10);

    const matches = (profiles ?? []).filter((p) => p.id !== user?.id);

    let followingIds = new Set<string>();
    if (user && matches.length) {
      const { data: followRows } = await supabase
        .from("follow")
        .select("followee_id")
        .eq("follower_id", user.id)
        .in(
          "followee_id",
          matches.map((m) => m.id),
        );
      followingIds = new Set((followRows ?? []).map((f) => f.followee_id));
    }

    people = matches.map((p) => ({
      id: p.id,
      username: p.username,
      displayName: p.display_name,
      isFollowing: followingIds.has(p.id),
    }));
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-5">
      <h1 className="font-heading text-2xl font-bold">Search</h1>

      <form className="flex gap-2">
        <Input
          type="text"
          name="q"
          placeholder="Search books, films, series, people..."
          defaultValue={query}
          autoFocus
          className="rounded-full"
        />
        <Button type="submit" className="rounded-full">
          Search
        </Button>
      </form>

      <PeopleResults people={people} isLoggedIn={Boolean(user)} />

      <SearchResults results={results} query={query} />
    </div>
  );
}
