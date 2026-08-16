import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { StarRating } from "@/components/star-rating";
import { FeedActions, type CommentData } from "@/components/feed-actions";
import { statusVerbPhrase, type LogStatus } from "@/lib/media/status-labels";
import type { MediaType } from "@/lib/media/types";

export type CommunityEntry = {
  id: string;
  rating: number | null;
  status: string;
  reviewBody: string | null;
  user: { username: string; display_name: string | null };
  isLiked: boolean;
  likeCount: number;
  comments: CommentData[];
};

export function CommunityReviewCard({
  entry,
  mediaType,
  isLoggedIn,
  path,
}: {
  entry: CommunityEntry;
  mediaType: MediaType;
  isLoggedIn: boolean;
  path: string;
}) {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-2xl p-4">
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
            {statusVerbPhrase(entry.status as LogStatus, mediaType)}
          </span>
        </div>
        {entry.rating && (
          <StarRating rating={entry.rating} className="ml-auto text-sm" />
        )}
      </div>

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
        path={path}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
