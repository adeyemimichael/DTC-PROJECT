"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="w-full py-4 sm:py-6 px-4 sm:px-8">
        <div className="container-brand flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <div className="relative h-8 sm:h-10 w-32 sm:w-40">
              <Image
                src="/images/logo.png"
                alt="Durom's Touch Clinic Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
          <div className="text-xs sm:text-sm font-medium text-secondary-600 text-right">
            <span className="hidden sm:inline">
              {pathname !== "/user/login"
                ? "Already have an account? "
                : "Don't have an account? "}
            </span>
            <Link
              href={
                pathname !== "/user/login" ? "/user/login" : "/user/register"
              }
              className="text-primary-blue hover:underline font-semibold"
            >
              {pathname !== "/user/login" ? "Sign In" : "Sign Up"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-6 sm:p-4">
        <div className="w-full container-brand">{children}</div>
      </main>
    </div>
  );
}
