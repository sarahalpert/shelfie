"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveLog } from "@/app/actions/log";
import { cn } from "@/lib/utils";

const STATUSES = [
  { value: "want", label: "Want to" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
] as const;

type Status = (typeof STATUSES)[number]["value"];

export function LogControl({
  mediaItemId,
  initialRating,
  initialStatus,
  initialReview,
  path,
}: {
  mediaItemId: string;
  initialRating: number | null;
  initialStatus: Status | null;
  initialReview: string;
  path: string;
}) {
  const [rating, setRating] = useState(initialRating);
  const [status, setStatus] = useState<Status>(initialStatus ?? "done");
  const [review, setReview] = useState(initialReview);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await saveLog({ mediaItemId, rating, status, reviewBody: review, path });
      setSaved(true);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              setRating(star);
              setSaved(false);
            }}
            aria-label={`Rate ${star} stars`}
            className={cn(
              "text-2xl leading-none",
              rating && star <= rating
                ? "text-foreground"
                : "text-muted-foreground/30",
            )}
          >
            ★
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => {
              setStatus(s.value);
              setSaved(false);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              status === s.value && "bg-foreground text-background",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <textarea
        value={review}
        onChange={(e) => {
          setReview(e.target.value);
          setSaved(false);
        }}
        placeholder="Write a review (optional)"
        className="min-h-20 rounded-md border p-2 text-sm"
      />

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? "Saving..." : saved ? "Saved" : "Save"}
      </Button>
    </div>
  );
}
