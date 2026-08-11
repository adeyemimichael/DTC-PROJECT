"use client"
import React from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation'
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

export default function ForgotPasswordPage() {
   const router = useRouter()
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] font-bold text-gray-900 tracking-tight mb-3">
          Forgot Password
        </h1>
        <p className="text-secondary-600 text-lg">
          Enter your details below for password reset link
        </p>
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

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-4 rounded-xl text-base font-semibold"
          >
            Request link
          </Button>
        </div>

        <div className="flex justify-center pt-2">
        
                <button onClick={() => router.push('/user/login')}    className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                      Back to sign in
                </button>
          
          
     
        </div>
      </form>
    </div>
  );
}
