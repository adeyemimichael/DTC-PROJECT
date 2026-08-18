import React, { ComponentType } from "react";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
  isLoading?: boolean;
}

export interface NavigationSection {
  id: string;
  label?: string;
  items: NavigationItem[];
}

export interface NavigationConfig {
  sections: NavigationSection[];
}

export interface UserProfile {
  id?: string;
  firstname: string;
  lastname: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface SidebarProps {
  config: NavigationConfig;
  user?: UserProfile;
  logo?: React.ReactNode;
  className?: string;
  isMobileOpen?: boolean;
  onClose?: () => void;
}
