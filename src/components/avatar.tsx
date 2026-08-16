import { cn } from "@/lib/utils";

export function Avatar({
  username,
  size = "md",
}: {
  username: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "bg-secondary text-secondary-foreground flex shrink-0 items-center justify-center rounded-full font-medium",
        size === "sm" ? "size-8 text-sm" : "size-12 text-lg",
      )}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}
