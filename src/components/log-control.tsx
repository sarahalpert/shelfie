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
    <div className="bg-card flex flex-col gap-4 rounded-2xl p-4">
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
                ? "text-primary"
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
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              status === s.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
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
        className="bg-input/20 min-h-20 rounded-xl border-0 p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
      />

      <Button onClick={handleSave} disabled={isPending} className="rounded-full">
        {isPending ? "Saving..." : saved ? "Saved" : "Save"}
      </Button>
    </div>
  );
}
