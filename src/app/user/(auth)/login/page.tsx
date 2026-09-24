"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className=" max-w-md mx-auto ">
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] font-bold text-gray-900 tracking-tight mb-2">
          Log Into Your Account
        </h1>
        <p className="text-secondary-600 text-lg">Welcome back!</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="e.g john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-900"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="flex justify-end pt-1">
            <Link
              href="/user/forgot-password"
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="w-full py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2"
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
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </div>
  );
}
