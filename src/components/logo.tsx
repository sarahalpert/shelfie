import { cn } from "@/lib/utils";

export function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  const iconSize = size === "sm" ? 28 : 56;

  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/shelfie-icon.svg"
        alt=""
        className="shrink-0"
        style={{ height: iconSize, width: "auto" }}
      />
      <span
        className={cn(
          "font-heading font-bold tracking-tight text-[#4BB6BC]",
          size === "sm" ? "text-xl" : "text-4xl",
        )}
      >
        SHELFIE
      </span>
    </span>
  );
}
