"use client";

import { useState, useTransition } from "react";
import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveLog } from "@/app/actions/log";

export function AddToShelfButton({
  mediaItemId,
  initialIsOnShelf,
  path,
}: {
  mediaItemId: string;
  initialIsOnShelf: boolean;
  path: string;
}) {
  const [isOnShelf, setIsOnShelf] = useState(initialIsOnShelf);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (isOnShelf || isPending) return;
    startTransition(async () => {
      await saveLog({
        mediaItemId,
        rating: null,
        status: "want",
        reviewBody: "",
        path,
      });
      setIsOnShelf(true);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isOnShelf || isPending}
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
          On your shelf
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
