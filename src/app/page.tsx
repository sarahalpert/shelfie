import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { FeedCard, type FeedEntry } from "@/components/feed-card";
import { buildMediaHref } from "@/lib/media/href";

function MarketingHero() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-heading text-3xl font-bold">
        Shelfie<span className="text-primary">.</span>
      </h1>
      <p className="text-muted-foreground max-w-md">
        Rate and discuss books, movies, and TV with your friends.
      </p>
      <Button
        nativeButton={false}
        render={<Link href="/search" />}
        className="rounded-full"
      >
        Search
      </Button>
    </div>
  );
}

type RawLogRow = {
  id: string;
  rating: number | null;
  status: string;
  created_at: string;
  user: { username: string; display_name: string | null };
  media_item: {
    type: string;
    external_id: string;
    title: string;
    year: number | null;
    image_url: string | null;
    metadata: Record<string, unknown> | null;
  };
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <MarketingHero />;

  const { data: follows } = await supabase
    .from("follow")
    .select("followee_id")
    .eq("follower_id", user.id);

  const followeeIds = follows?.map((f) => f.followee_id) ?? [];

  let logs: RawLogRow[] = [];
  if (followeeIds.length) {
    const { data } = await supabase
      .from("log")
      .select(
        "id, rating, status, created_at, user:user_id(username, display_name), media_item:media_item_id(type, external_id, title, year, image_url, metadata)",
      )
      .in("user_id", followeeIds)
      .order("created_at", { ascending: false })
      .limit(30)
      .returns<RawLogRow[]>();
    logs = data ?? [];
  }

  const logIds = logs.map((l) => l.id);
  const { data: reviews } = logIds.length
    ? await supabase
        .from("review")
        .select("log_id, body")
        .in("log_id", logIds)
    : { data: [] };
  const reviewByLogId = new Map((reviews ?? []).map((r) => [r.log_id, r.body]));

  const entries: FeedEntry[] = logs.map((log) => ({
    id: log.id,
    rating: log.rating,
    status: log.status,
    created_at: log.created_at,
    reviewBody: reviewByLogId.get(log.id) ?? null,
    user: log.user,
    media_item: log.media_item,
    mediaHref: buildMediaHref(log.media_item),
  }));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-5">
      <h1 className="font-heading text-2xl font-bold">Feed</h1>

      {entries.length === 0 && (
        <p className="text-muted-foreground">
          Follow people to see what they&apos;re logging here.{" "}
          <Link href="/search" className="text-primary underline">
            Search
          </Link>{" "}
          for something to log yourself.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <FeedCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
