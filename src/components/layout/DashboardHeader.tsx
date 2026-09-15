"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isDoctor = pathname?.startsWith("/doctor");

  const getHeaderTitle = (path: string) => {
    if (path.includes("overview")) return "Overview";
    if (path.includes("appointments")) return "Appointments";
    if (path.includes("patients")) return "Patients";
    if (path.includes("messages")) return "Messages";
    if (path.includes("medical-info")) return "Medical Info";
    if (path.includes("settings")) return "Settings";
    if (path.includes("help")) return "Help";
    return "Dashboard";
  };

  const logout = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "An error occurred while logging out. Please try again.",
        );
      }
      toast.success("Logged out successfully!", { id: toastId });
      router.replace("/user/login");
    } catch (err: any) {
      toast.error(
        err.message || "An error occurred while logging out. Please try again.",
      );
    }
  };

  return (
    <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 mr-2 text-slate-500 hover:text-primary-deepblue md:hidden rounded-lg hover:bg-slate-50 cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight font-sans">
          {getHeaderTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* User Account avatar slot */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full overflow-hidden relative border border-slate-200 bg-slate-100 shrink-0">
            <Image
              src={
                isDoctor ? "/images/stephen.jpg" : "/images/sarah_avatar.png"
              }
              alt="User Avatar"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <button className="relative p-2 text-slate-500 hover:text-gray-900 hover:bg-slate-50 rounded-full transition-colors duration-200 cursor-pointer">
          <Bell className="h-5 w-5" />
        </button>

        <button
          onClick={logout}
          className="relative p-2 text-primary-red hover:text-[#d80300] rounded-full transition-colors duration-200 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
