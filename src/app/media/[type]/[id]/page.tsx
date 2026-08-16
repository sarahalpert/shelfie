import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTmdbDetail } from "@/lib/media/tmdb";
import { getGoogleBooksDetail } from "@/lib/media/googlebooks";
import { upsertMediaItem } from "@/lib/media/cache";
import { MediaItemData, MediaType } from "@/lib/media/types";
import { createClient } from "@/lib/supabase/server";
import { LogControl } from "@/components/log-control";
import { StarRating } from "@/components/star-rating";
import {
  CommunityReviewCard,
  type CommunityEntry,
} from "@/components/community-review-card";
import type { CommentData } from "@/components/feed-actions";

function isTmdbType(type: string): type is Extract<MediaType, "movie" | "tv"> {
  return type === "movie" || type === "tv";
}

async function loadItem(type: string, id: string): Promise<MediaItemData | null> {
  if (isTmdbType(type)) return getTmdbDetail(type, id);
  if (type === "book") return getGoogleBooksDetail(id);
  return null;
}

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const item = await loadItem(type, id);

  if (!item) notFound();

  const mediaItemId = await upsertMediaItem(item);
  const path = `/media/${type}/${id}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingLog: {
    rating: number | null;
    status: "want" | "in_progress" | "done";
    review: string;
  } | null = null;

  if (user && mediaItemId) {
    const { data: logRow } = await supabase
      .from("log")
      .select("id, rating, status")
      .eq("user_id", user.id)
      .eq("media_item_id", mediaItemId)
      .maybeSingle();

    if (logRow) {
      const { data: reviewRow } = await supabase
        .from("review")
        .select("body")
        .eq("log_id", logRow.id)
        .maybeSingle();

      existingLog = {
        rating: logRow.rating,
        status: logRow.status,
        review: reviewRow?.body ?? "",
      };
    }
  }

  // Community: everyone else's logs for this item, split into people the
  // viewer follows vs. everyone else, plus an overall average rating.
  let friendEntries: CommunityEntry[] = [];
  let otherEntries: CommunityEntry[] = [];
  let avgRating: number | null = null;
  let ratingCount = 0;

  if (mediaItemId) {
    const { data: itemLogs } = await supabase
      .from("log")
      .select(
        "id, user_id, rating, status, created_at, user:user_id(username, display_name)",
      )
      .eq("media_item_id", mediaItemId)
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<
        {
          id: string;
          user_id: string;
          rating: number | null;
          status: string;
          created_at: string;
          user: { username: string; display_name: string | null };
        }[]
      >();

    const allLogs = itemLogs ?? [];
    const ratedLogs = allLogs.filter((l) => l.rating != null);
    ratingCount = ratedLogs.length;
    avgRating = ratingCount
      ? ratedLogs.reduce((sum, l) => sum + (l.rating ?? 0), 0) / ratingCount
      : null;

    const othersLogs = allLogs.filter((l) => l.user_id !== user?.id);
    const otherLogIds = othersLogs.map((l) => l.id);

    const { data: otherReviews } = otherLogIds.length
      ? await supabase
          .from("review")
          .select("log_id, body")
          .in("log_id", otherLogIds)
      : { data: [] };
    const reviewByLogId = new Map(
      (otherReviews ?? []).map((r) => [r.log_id, r.body]),
    );

    const { data: otherLikeRows } = otherLogIds.length
      ? await supabase
          .from("likes")
          .select("log_id, user_id")
          .in("log_id", otherLogIds)
      : { data: [] };
    const likeCountByLog = new Map<string, number>();
    const likedByViewer = new Set<string>();
    (otherLikeRows ?? []).forEach((r) => {
      likeCountByLog.set(r.log_id, (likeCountByLog.get(r.log_id) ?? 0) + 1);
      if (user && r.user_id === user.id) likedByViewer.add(r.log_id);
    });

    const { data: otherCommentRows } = otherLogIds.length
      ? await supabase
          .from("comments")
          .select("id, log_id, body, user:user_id(username, display_name)")
          .in("log_id", otherLogIds)
          .order("created_at", { ascending: true })
          .returns<
            {
              id: string;
              log_id: string;
              body: string;
              user: { username: string; display_name: string | null };
            }[]
          >()
      : { data: [] };
    const commentsByLog = new Map<string, CommentData[]>();
    (otherCommentRows ?? []).forEach((c) => {
      const arr = commentsByLog.get(c.log_id) ?? [];
      arr.push({
        id: c.id,
        body: c.body,
        username: c.user.username,
        displayName: c.user.display_name,
      });
      commentsByLog.set(c.log_id, arr);
    });

    let followeeIds = new Set<string>();
    if (user && othersLogs.length) {
      const { data: followRows } = await supabase
        .from("follow")
        .select("followee_id")
        .eq("follower_id", user.id);
      followeeIds = new Set((followRows ?? []).map((f) => f.followee_id));
    }

    const communityEntries: (CommunityEntry & { isFriend: boolean })[] =
      othersLogs.map((l) => ({
        id: l.id,
        rating: l.rating,
        status: l.status,
        reviewBody: reviewByLogId.get(l.id) ?? null,
        user: l.user,
        isLiked: likedByViewer.has(l.id),
        likeCount: likeCountByLog.get(l.id) ?? 0,
        comments: commentsByLog.get(l.id) ?? [],
        isFriend: followeeIds.has(l.user_id),
      }));

    friendEntries = communityEntries.filter((e) => e.isFriend);
    otherEntries = communityEntries.filter((e) => !e.isFriend);
  }

  const overview =
    typeof item.metadata.overview === "string" ? item.metadata.overview : "";
  const authors = Array.isArray(item.metadata.authors)
    ? (item.metadata.authors as string[])
    : [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-5">
      <div className="flex gap-6">
        <div className="bg-muted h-60 w-40 shrink-0 overflow-hidden rounded-2xl">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={160}
              height={240}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-primary text-xs font-medium uppercase">
            {item.type}
          </span>
          <h1 className="font-heading text-2xl font-bold">{item.title}</h1>
          {item.year && (
            <span className="text-muted-foreground">{item.year}</span>
          )}
          {authors.length > 0 && (
            <span className="text-muted-foreground">
              by {authors.join(", ")}
            </span>
          )}
          {avgRating !== null && (
            <div className="flex items-center gap-2">
              <StarRating rating={avgRating} />
              <span className="text-muted-foreground text-sm">
                {avgRating.toFixed(1)} · {ratingCount}{" "}
                {ratingCount === 1 ? "rating" : "ratings"}
              </span>
            </div>
          )}
          {overview && <p className="mt-2 leading-relaxed">{overview}</p>}
        </div>
      </div>

      {mediaItemId &&
        (user ? (
          <LogControl
            mediaItemId={mediaItemId}
            mediaType={item.type}
            initialRating={existingLog?.rating ?? null}
            initialStatus={existingLog?.status ?? null}
            initialReview={existingLog?.review ?? ""}
            path={path}
          />
        ) : (
          <p className="text-muted-foreground bg-card rounded-2xl p-4 text-sm">
            <Link href="/login" className="text-primary underline">
              Log in
            </Link>{" "}
            to add this to your shelf.
          </p>
        ))}

      {mediaItemId && (
        <div className="flex flex-col gap-4">
          {friendEntries.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-lg font-bold">
                From people you follow
              </h2>
              {friendEntries.map((entry) => (
                <CommunityReviewCard
                  key={entry.id}
                  entry={entry}
                  mediaType={item.type}
                  isLoggedIn={Boolean(user)}
                  path={path}
                />
              ))}
            </div>
          )}

          {otherEntries.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-lg font-bold">
                More reviews
              </h2>
              {otherEntries.map((entry) => (
                <CommunityReviewCard
                  key={entry.id}
                  entry={entry}
                  mediaType={item.type}
                  isLoggedIn={Boolean(user)}
                  path={path}
                />
              ))}
            </div>
          )}

          {friendEntries.length === 0 && otherEntries.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No one else has logged this yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
