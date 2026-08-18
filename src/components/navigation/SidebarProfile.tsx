"use client";

import React from "react";
import Image from "next/image";
import { UserProfile } from "./types";

interface SidebarProfileProps {
  user?: UserProfile;
}

export default function SidebarProfile({ user }: SidebarProfileProps) {
  if (!user) return null;

  const getInitials = (firstname: string = "", lastname: string = ""): string => {
    const combined = `${firstname} ${lastname}`.trim();
    if (!combined) return "U";
    return combined
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const fullName = `${user.firstname} ${user.lastname}`.trim() || user.email;

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
      {/* Avatar or Fallback Initials */}
      <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-primary-red/10 flex items-center justify-center">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={fullName}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-primary-red font-bold text-xs">
            {getInitials(user.firstname, user.lastname)}
          </span>
        )}
      </div>

      {/* User Info */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-bold text-xs text-gray-900 truncate">
          {fullName}
        </span>
        <span className="text-[11px] font-medium text-gray-500 truncate mt-0.5">
          {user.role || user.email}
        </span>
      </div>
    </div>
  );
}
