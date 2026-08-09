import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          Already have an account?{" "}
          <Link href="/register" className="text-primary-blue hover:underline">
            Sign up
          </Link>
        </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[480px]">
          {children}
        </div>
      </main>
    </div>
  );
}
