"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/app/actions/follow";

export function FollowButton({
  followeeId,
  username,
  initialIsFollowing,
}: {
  followeeId: string;
  username: string;
  initialIsFollowing: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await toggleFollow({ followeeId, username, isFollowing });
      setIsFollowing((prev) => !prev);
    });
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={isFollowing ? "secondary" : "default"}
      size="sm"
      className="rounded-full"
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
