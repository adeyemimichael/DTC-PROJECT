"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { SidebarProps } from "./types";
import SidebarNav from "./SidebarNav";


export function Sidebar({
  config,
  logo,
  className = "",
  isMobileOpen = false,
  onClose,
}: SidebarProps) {
  // Separate main navigation sections from footer system sections 
  const mainSections = config.sections.filter((s) => s.id !== "system");
  const footerSections = config.sections.filter((s) => s.id === "system");

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${className}`}
      >
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div className="flex-1">
            {logo || (
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo.png"
                  alt="Durom's Touch Clinic Logo"
                  width={130}
                  height={40}
                  priority
                  className="object-contain h-10 w-auto"
                />
              </Link>
            )}
          </div>

          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-2 text-gray-400 hover:text-primary-red rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Close navigation sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Scrollable Main Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <SidebarNav sections={mainSections} onItemClick={onClose} />
        </div>

        {/* Footer Navigation (Help & Settings) */}
        {footerSections.length > 0 && (
          <div className="border-t border-slate-100 p-4 shrink-0">
            <SidebarNav sections={footerSections} onItemClick={onClose} />
          </div>
        )}
      </aside>
    </>
  );
}
