"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleLike, addComment } from "@/app/actions/social";
import { Avatar } from "@/components/avatar";

export type CommentData = {
  id: string;
  body: string;
  username: string;
  displayName: string | null;
};

export function FeedActions({
  logId,
  initialLiked,
  initialLikeCount,
  initialComments,
  path,
  isLoggedIn = true,
}: {
  logId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialComments: CommentData[];
  path: string;
  isLoggedIn?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLikePending, startLikeTransition] = useTransition();

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [isCommentPending, startCommentTransition] = useTransition();

  function handleLike() {
    if (isLikePending) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));
    startLikeTransition(async () => {
      await toggleLike({ logId, isLiked: wasLiked, path });
    });
  }

  function handleAddComment() {
    const trimmed = commentText.trim();
    if (!trimmed || isCommentPending) return;
    startCommentTransition(async () => {
      const newComment = await addComment({ logId, body: trimmed, path });
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-4 border-t pt-3">
        {isLoggedIn ? (
          <button
            type="button"
            onClick={handleLike}
            className="text-muted-foreground flex items-center gap-1.5 text-sm"
          >
            <Heart
              className={cn("size-4", liked && "fill-primary text-primary")}
            />
            {likeCount > 0 ? likeCount : "Like"}
          </button>
        ) : (
          <Link
            href="/login"
            className="text-muted-foreground flex items-center gap-1.5 text-sm"
          >
            <Heart className="size-4" />
            {likeCount > 0 ? likeCount : "Like"}
          </Link>
        )}
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="text-muted-foreground flex items-center gap-1.5 text-sm"
        >
          <MessageCircle className="size-4" />
          {comments.length > 0 ? comments.length : "Comment"}
        </button>
      </div>

      {showComments && (
        <div className="flex flex-col gap-2">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar username={c.username} size="sm" />
              <div className="bg-muted flex-1 rounded-2xl px-3 py-2 text-sm">
                <span className="font-medium">
                  {c.displayName ?? c.username}
                </span>{" "}
                {c.body}
              </div>
            </div>
          ))}

          {isLoggedIn ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder="Write a comment..."
                className="bg-input/20 focus:ring-primary flex-1 rounded-full px-4 py-2 text-sm outline-none focus:ring-2"
              />
              <button
                type="button"
                onClick={handleAddComment}
                disabled={isCommentPending || !commentText.trim()}
                className="text-primary text-sm font-medium disabled:opacity-40"
              >
                Post
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-primary text-sm underline">
              Log in to comment
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
