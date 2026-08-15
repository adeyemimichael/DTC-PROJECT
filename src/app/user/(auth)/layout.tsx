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
  console.log("Current pathname:", pathname); // Debugging line to check the pathname
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="w-full py-6 px-8 flex items-center justify-between">
        <div className="container-brand flex items-center justify-between">
          <Link href="/">
            <div className="relative h-10 w-40">
              <Image
                src="/images/logo.png" // using .png or .webp based on the directory
                alt="Durom's Touch Clinic Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
          <div className="text-sm font-medium text-secondary-600">
            {pathname !== "/user/login"
              ? "Already have an account? "
              : "Don't have an account? "}{" "}
            <Link
              href={
                pathname !== "/user/login" ? "/user/login" : "/user/register"
              }
              className="text-primary-blue hover:underline"
            >
              {pathname !== "/user/login" ? "Sign In" : "Sign Up"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full  container-brand">{children}</div>
      </main>
    </div>
  );
}
