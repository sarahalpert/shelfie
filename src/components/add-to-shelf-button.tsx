"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveLog, deleteLogByMediaItem } from "@/app/actions/log";

export function AddToShelfButton({
  mediaItemId,
  initialIsOnShelf,
  hasRating,
  mediaHref,
  path,
}: {
  mediaItemId: string;
  initialIsOnShelf: boolean;
  hasRating: boolean;
  mediaHref: string;
  path: string;
}) {
  const [isOnShelf, setIsOnShelf] = useState(initialIsOnShelf);
  const [isPending, startTransition] = useTransition();

  // A rated/reviewed log is meaningful enough that a compact feed button
  // shouldn't be able to silently delete it -- send them to the detail
  // page to manage it deliberately instead.
  if (isOnShelf && hasRating) {
    return (
      <Link
        href={mediaHref}
        className="bg-secondary text-secondary-foreground flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
      >
        <Check className="size-3.5" />
        On your shelf
      </Link>
    );
  }

  function handleClick() {
    if (isPending) return;
    startTransition(async () => {
      if (isOnShelf) {
        await deleteLogByMediaItem({ mediaItemId, path });
        setIsOnShelf(false);
      } else {
        await saveLog({
          mediaItemId,
          rating: null,
          status: "want",
          reviewBody: "",
          path,
        });
        setIsOnShelf(true);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        isOnShelf
          ? "bg-secondary text-secondary-foreground"
          : "bg-primary text-primary-foreground",
      )}
    >
      {isOnShelf ? (
        <>
          <Check className="size-3.5" />
          {isPending ? "Removing..." : "On your shelf"}
        </>
      ) : (
        <>
          <Plus className="size-3.5" />
          {isPending ? "Adding..." : "Add to shelf"}
        </>
      )}
    </button>
  );
}
