import { createClient } from "@/lib/supabase/server";
import { searchBooks } from "@/lib/media/openlibrary";
import { searchMoviesAndTv } from "@/lib/media/tmdb";
import { buildMediaHref } from "@/lib/media/href";
import { HomeContent } from "@/components/home-content";
import type { FeedEntry } from "@/components/feed-card";
import type { CommentData } from "@/components/feed-actions";
import type { PersonResult } from "@/components/people-results";

type RawLogRow = {
  id: string;
  rating: number | null;
  status: string;
  created_at: string;
  user: { username: string; display_name: string | null };
  media_item: {
    id: string;
    type: string;
    external_id: string;
    title: string;
    year: number | null;
    image_url: string | null;
    metadata: Record<string, unknown> | null;
  };
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Search mode: fetch media + people results, skip the feed entirely.
  if (query.length > 0) {
    const searchResults = (
      await Promise.all([searchBooks(query), searchMoviesAndTv(query)])
    ).flat();

    let people: PersonResult[] = [];
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

    return (
      <HomeContent
        query={query}
        searchResults={searchResults}
        people={people}
        isLoggedIn={Boolean(user)}
        feedEntries={[]}
      />
    );
  }

  // Feed mode (logged out users see a marketing blurb instead).
  if (!user) {
    return (
      <HomeContent
        query=""
        searchResults={[]}
        people={[]}
        isLoggedIn={false}
        feedEntries={[]}
      />
    );
  }

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
        "id, rating, status, created_at, user:user_id(username, display_name), media_item:media_item_id(id, type, external_id, title, year, image_url, metadata)",
      )
      .in("user_id", followeeIds)
      .order("created_at", { ascending: false })
      .limit(30)
      .returns<RawLogRow[]>();
    logs = data ?? [];
  }

  const logIds = logs.map((l) => l.id);
  const { data: reviews } = logIds.length
    ? await supabase.from("review").select("log_id, body").in("log_id", logIds)
    : { data: [] };
  const reviewByLogId = new Map((reviews ?? []).map((r) => [r.log_id, r.body]));

  const { data: likeRows } = logIds.length
    ? await supabase.from("likes").select("log_id, user_id").in("log_id", logIds)
    : { data: [] };
  const likeCountByLog = new Map<string, number>();
  const likedByViewer = new Set<string>();
  (likeRows ?? []).forEach((r) => {
    likeCountByLog.set(r.log_id, (likeCountByLog.get(r.log_id) ?? 0) + 1);
    if (r.user_id === user.id) likedByViewer.add(r.log_id);
  });

  const { data: commentRows } = logIds.length
    ? await supabase
        .from("comments")
        .select("id, log_id, body, user:user_id(username, display_name)")
        .in("log_id", logIds)
        .order("created_at", { ascending: true })
    : { data: [] };
  const commentsByLog = new Map<string, CommentData[]>();
  (
    commentRows as
      | {
          id: string;
          log_id: string;
          body: string;
          user: { username: string; display_name: string | null };
        }[]
      | null
  )?.forEach((c) => {
    const arr = commentsByLog.get(c.log_id) ?? [];
    arr.push({
      id: c.id,
      body: c.body,
      username: c.user.username,
      displayName: c.user.display_name,
    });
    commentsByLog.set(c.log_id, arr);
  });

  const mediaItemIds = [...new Set(logs.map((l) => l.media_item.id))];
  const { data: myLogs } = mediaItemIds.length
    ? await supabase
        .from("log")
        .select("media_item_id, rating")
        .eq("user_id", user.id)
        .in("media_item_id", mediaItemIds)
    : { data: [] };
  const myShelfRatingByMediaItem = new Map(
    (myLogs ?? []).map((l) => [l.media_item_id, l.rating]),
  );

  const entries: FeedEntry[] = logs.map((log) => ({
    id: log.id,
    rating: log.rating,
    status: log.status,
    created_at: log.created_at,
    reviewBody: reviewByLogId.get(log.id) ?? null,
    user: log.user,
    mediaItemId: log.media_item.id,
    media_item: log.media_item,
    mediaHref: buildMediaHref(log.media_item),
    isOnMyShelf: myShelfRatingByMediaItem.has(log.media_item.id),
    myShelfHasRating: Boolean(
      myShelfRatingByMediaItem.get(log.media_item.id),
    ),
    isLiked: likedByViewer.has(log.id),
    likeCount: likeCountByLog.get(log.id) ?? 0,
    comments: commentsByLog.get(log.id) ?? [],
  }));

  return (
    <HomeContent
      query=""
      searchResults={[]}
      people={[]}
      isLoggedIn
      feedEntries={entries}
    />
  );
}
