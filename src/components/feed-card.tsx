import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { AddToShelfButton } from "@/components/add-to-shelf-button";
import { FeedActions, type CommentData } from "@/components/feed-actions";
import { statusVerbPhrase, type LogStatus } from "@/lib/media/status-labels";
import type { MediaType } from "@/lib/media/types";

export type FeedEntry = {
  id: string;
  rating: number | null;
  status: string;
  created_at: string;
  reviewBody: string | null;
  user: { username: string; display_name: string | null };
  mediaItemId: string;
  media_item: {
    title: string;
    type: string;
    year: number | null;
    image_url: string | null;
  };
  mediaHref: string;
  isOnMyShelf: boolean;
  isLiked: boolean;
  likeCount: number;
  comments: CommentData[];
};

export function FeedCard({
  entry,
  showAddToShelf,
}: {
  entry: FeedEntry;
  showAddToShelf: boolean;
}) {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar username={entry.user.username} size="sm" />
          <div className="flex flex-col leading-tight">
            <Link
              href={`/u/${entry.user.username}`}
              className="text-sm font-medium"
            >
              {entry.user.display_name ?? entry.user.username}
            </Link>
            <span className="text-muted-foreground text-xs">
              {statusVerbPhrase(
                entry.status as LogStatus,
                entry.media_item.type as MediaType,
              )}
            </span>
          </div>
        </div>

        {showAddToShelf && (
          <AddToShelfButton
            mediaItemId={entry.mediaItemId}
            initialIsOnShelf={entry.isOnMyShelf}
            path="/"
          />
        )}
      </div>

      <Link href={entry.mediaHref} className="flex gap-3">
        <div className="bg-muted h-20 w-14 shrink-0 overflow-hidden rounded-lg">
          {entry.media_item.image_url && (
            <Image
              src={entry.media_item.image_url}
              alt={entry.media_item.title}
              width={56}
              height={80}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-primary text-xs font-medium uppercase">
            {entry.media_item.type}
          </span>
          <span className="font-medium leading-tight">
            {entry.media_item.title}
          </span>
          {entry.rating && (
            <span className="text-primary text-sm">
              {"★".repeat(entry.rating)}
              <span className="text-muted-foreground/30">
                {"★".repeat(5 - entry.rating)}
              </span>
            </span>
          )}
        </div>
      </Link>

      {entry.reviewBody && (
        <p className="text-muted-foreground text-sm leading-relaxed">
          {entry.reviewBody}
        </p>
      )}

      <FeedActions
        logId={entry.id}
        initialLiked={entry.isLiked}
        initialLikeCount={entry.likeCount}
        initialComments={entry.comments}
        path="/"
      />
    </div>
  );
}
