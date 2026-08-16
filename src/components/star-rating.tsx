import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex", className)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = rating >= n ? 1 : rating >= n - 0.5 ? 0.5 : 0;
        return (
          <span key={n} className="relative inline-block leading-none">
            <span className="text-muted-foreground/30">★</span>
            {fill > 0 && (
              <span
                className="text-primary absolute inset-0 overflow-hidden"
                style={{ width: fill === 1 ? "100%" : "50%" }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
