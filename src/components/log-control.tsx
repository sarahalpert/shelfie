"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveLog, deleteLogByMediaItem } from "@/app/actions/log";
import { cn } from "@/lib/utils";
import { statusLabel, type LogStatus } from "@/lib/media/status-labels";
import type { MediaType } from "@/lib/media/types";

const STATUS_VALUES: LogStatus[] = ["want", "in_progress", "done"];

function RatingInput({
  rating,
  onChange,
}: {
  rating: number | null;
  onChange: (rating: number | null) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const fill =
          rating != null && rating >= n
            ? 1
            : rating != null && rating >= n - 0.5
              ? 0.5
              : 0;

        return (
          <button
            key={n}
            type="button"
            aria-label={`Rate ${n} stars`}
            className="relative text-2xl leading-none"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickedHalf = e.clientX - rect.left < rect.width / 2;
              const value = clickedHalf ? n - 0.5 : n;
              onChange(rating === value ? null : value);
            }}
          >
            <span className="text-muted-foreground/30">★</span>
            {fill > 0 && (
              <span
                className="text-primary absolute inset-0 overflow-hidden"
                style={{ width: fill === 1 ? "100%" : "50%" }}
              >
                ★
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function LogControl({
  mediaItemId,
  mediaType,
  initialRating,
  initialStatus,
  initialReview,
  path,
}: {
  mediaItemId: string;
  mediaType: MediaType;
  initialRating: number | null;
  initialStatus: LogStatus | null;
  initialReview: string;
  path: string;
}) {
  const [rating, setRating] = useState(initialRating);
  const [status, setStatus] = useState<LogStatus>(initialStatus ?? "done");
  const [review, setReview] = useState(initialReview);
  const [hasExistingLog, setHasExistingLog] = useState(initialStatus !== null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await saveLog({ mediaItemId, rating, status, reviewBody: review, path });
      setHasExistingLog(true);
      setSaved(true);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await deleteLogByMediaItem({ mediaItemId, path });
      setRating(null);
      setStatus("done");
      setReview("");
      setHasExistingLog(false);
      setSaved(false);
    });
  }

  return (
    <div className="bg-card flex flex-col gap-4 rounded-2xl p-4">
      <RatingInput
        rating={rating}
        onChange={(value) => {
          setRating(value);
          setSaved(false);
        }}
      />

      <div className="flex gap-2">
        {STATUS_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setStatus(value);
              setSaved(false);
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              status === value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {statusLabel(value, mediaType)}
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

      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 rounded-full"
        >
          {isPending ? "Saving..." : saved ? "Saved" : "Save"}
        </Button>

        {hasExistingLog && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="text-muted-foreground text-xs underline disabled:opacity-40"
          >
            Remove from shelf
          </button>
        )}
      </div>
    </div>
  );
}
