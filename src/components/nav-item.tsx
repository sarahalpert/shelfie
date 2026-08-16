"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
    >
      <span
        className={cn(
          "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground",
        )}
      >
        {icon}
        {label}
      </span>
    </Link>
  );
}
