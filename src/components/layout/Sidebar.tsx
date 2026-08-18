"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar as ConfigSidebar } from "@/components/navigation/Sidebar";
import { SidebarProps as ConfigSidebarProps } from "@/components/navigation/types";
import {
  doctorNavigationConfig,
  patientNavigationConfig,
  defaultDoctorUser,
  defaultPatientUser,
} from "@/config/navigationConfig";

export interface SidebarProps extends Partial<ConfigSidebarProps> {
  onClose?: () => void;
  isMobileOpen?: boolean;
}

/**
 * Smart Layout Wrapper for Sidebar Component
 * Auto-detects doctor vs patient navigation config based on pathname if not provided.
 */
export function Sidebar({
  config,
  user,
  onClose,
  isMobileOpen,
  ...props
}: SidebarProps) {
  const pathname = usePathname();
  const isDoctor = pathname?.startsWith("/doctor");

  const activeConfig =
    config || (isDoctor ? doctorNavigationConfig : patientNavigationConfig);
  const activeUser =
    user || (isDoctor ? defaultDoctorUser : defaultPatientUser);

  return (
    <ConfigSidebar
      config={activeConfig}
      user={activeUser}
      onClose={onClose}
      isMobileOpen={isMobileOpen}
      {...props}
    />
  );
}
