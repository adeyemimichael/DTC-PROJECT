import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function LoginPage() {
  return (
    <div className=" max-w-md mx-auto ">
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] font-bold text-gray-900 tracking-tight mb-2">
          Log Into Your Account
        </h1>
        <p className="text-secondary-600 text-lg">Welcome back!</p>
      </div>

      <form className="space-y-6">
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
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            required
          />
          <div className="flex justify-end pt-1">
            <Link
              href="user/forgot-password"
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-4 rounded-xl text-base font-semibold"
        >
          Log in
        </Button>
      </form>
    </div>
  );
}
