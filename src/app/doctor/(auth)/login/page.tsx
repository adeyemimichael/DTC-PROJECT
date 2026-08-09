'use client';

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // TODO: Replace with real auth logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/doctor/doctors-overview");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Top branding */}
      <header className="w-full flex flex-col items-center pt-10 pb-4">
        <Link href="/" className="flex flex-col items-center gap-1">
          <div className="relative h-10 w-40">
            <Image
              src="/images/logo.png"
              alt="Durom's Touch Clinic Logo"
              fill
              className="object-contain object-center"
              priority
            />
          </div>
          <span className="text-[15px] font-semibold tracking-[0.18em] text-secondary-500 uppercase mt-1">
            Staff Portal
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[480px]">
          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-[2.2rem] font-bold text-gray-900 tracking-tight mb-2">
              Welcome back, Doctor
            </h1>
            <p className="text-secondary-500 text-base">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-error-50 border border-error-200 text-error-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="e.g doctor@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
            </div>

            {/* Submit button */}
            <button
              id="doctor-sign-in-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-primary-red text-white font-semibold text-base
                hover:opacity-90 active:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center space-y-4">
            <p className="text-xs text-secondary-400">
              © 2026 Durom&apos;s Touch Clinic. Staff access only.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="M12 5l-7 7 7 7" />
              </svg>
              Back to website
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
