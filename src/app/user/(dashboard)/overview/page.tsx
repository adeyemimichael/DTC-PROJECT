"use client";

import { useProfile } from "@/hooks";
import {
  BookAppointmentButton,
  NextAppointmentCard,
  RecentActivityTimeline,
  QuickActionsList,
  NotificationsWidget,
} from "@/src/components/common";
import { OverviewClient } from "@/src/components/overview/OverviewClient";
import { Calendar } from "lucide-react";

export default function OverviewPage() {
  const { profile, isLoading } = useProfile();

  return (
    <div className="space-y-6 lg:space-y-8 max-w-6xl mx-auto">
      {/* Vitals Check Modal trigger (pops up only on overview if no vitals exist) */}
      <OverviewClient />

      {/* Welcome Banner Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {isLoading ? (
            <>
              <div className="h-6 w-56 rounded bg-slate-200 animate-pulse" />
              <div className="mt-2 h-4 w-40 rounded bg-slate-100 animate-pulse" />
            </>
          ) : (
            <>
              <h2 className="text-lg lg:text-xl font-semibold text-black tracking-tight">
                Welcome back, {profile?.full_name || "User"}!
              </h2>
              <p className="text-sm text-primary-gray mt-1 font-sans">
                Member since{" "}
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })
                  : "Recently"}{" "}
              </p>
            </>
          )}
        </div>
        <BookAppointmentButton className="btn-primary flex items-center gap-2 shadow-sm w-full sm:w-auto">
          <Calendar className="h-5 w-5" />
          Book Appointment
        </BookAppointmentButton>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <NextAppointmentCard />
          <RecentActivityTimeline />
        </div>

        <div className="space-y-6 lg:space-y-8">
          <QuickActionsList />
          <NotificationsWidget />
        </div>
      </div>
    </div>
  );
}
