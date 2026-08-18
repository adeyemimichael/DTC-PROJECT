"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { NavigationSection } from "./types";

interface SidebarNavProps {
  sections: NavigationSection[];
  onItemClick?: () => void;
  className?: string;
}

export default function SidebarNav({
  sections,
  onItemClick,
  className = "",
}: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  return (
    <nav aria-label="Sidebar navigation" className={`space-y-1.5 ${className}`}>
      {sections.map((section) => (
        <div key={section.id} className="space-y-1">
          {section.items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.id === "overview" && pathname?.includes("overview"));
            const isNavigating = loadingItemId === item.id && isPending;
            const Icon = item.icon;

            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              if (pathname === item.href) {
                e.preventDefault();
                if (onItemClick) onItemClick();
                return;
              }

              e.preventDefault();
              setLoadingItemId(item.id);
              startTransition(() => {
                router.push(item.href);
                if (onItemClick) onItemClick();
                setTimeout(() => setLoadingItemId(null), 400);
              });
            };

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={handleClick}
                className={`
                  flex items-center justify-between px-4 py-3.5 text-[15px] font-semibold rounded-xl transition-all duration-200 group
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red/20
                  ${
                    isActive
                      ? "bg-[#ffebeb] text-primary-red"
                      : "text-primary-red hover:bg-slate-50 hover:text-primary-red"
                  }
                  ${isNavigating ? "opacity-70 cursor-wait" : ""}
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive
                        ? "text-primary-red"
                        : "text-shadow-primary-red group-hover:text-primary-red"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {/* Navigation loading spinner */}
                {isNavigating && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary-red shrink-0" />
                )}

                {/* Loading skeleton for badge */}
                {!isNavigating && item.isLoading && (
                  <span className="h-5 w-5 bg-gray-200 rounded-full animate-pulse shrink-0" />
                )}

                {/* Badge count */}
                {!isNavigating &&
                  !item.isLoading &&
                  item.badge !== undefined &&
                  item.badge > 0 && (
                    <span
                      className="h-5.5 w-5.5 rounded-full bg-primary-red text-white text-xs font-bold flex items-center justify-center shrink-0"
                      aria-label={`${item.badge} unread items`}
                    >
                      {item.badge}
                    </span>
                  )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
