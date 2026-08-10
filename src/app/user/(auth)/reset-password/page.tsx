import React from "react";
import { Button } from "@/components/ui";

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] font-bold text-gray-900 tracking-tight mb-3">
          Forgot Password
        </h1>
        <p className="text-secondary-600 text-lg">Create a new password</p>
      </div>

      <form className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-900"
          >
            Create Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Minimum 8 characters"
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-900"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Repeat your password"
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            required
            minLength={8}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-4 rounded-xl text-base font-semibold"
          >
            Confirm
          </Button>
        </div>
      </form>
    </div>
  );
}
