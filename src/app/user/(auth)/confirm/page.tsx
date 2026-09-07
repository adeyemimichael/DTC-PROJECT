import { Button } from "@/components/ui";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import React from "react";

const Confirmation = () => {
  return (
    <div className="text-center py-12 px-6 md:px-10 bg-white w-full max-w-140 mx-auto">
      <div className="w-16 h-16 bg-[#edf2fa] rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-8 h-8 text-[#2e5bf0]" strokeWidth={2.5} />
      </div>
      <h2 className="text-[28px] md:text-[32px] font-bold text-primary-deepblue mb-3 tracking-tight">
        Registration Complete
      </h2>
      <p className="text-[15px] text-primary-gray mb-8 leading-relaxed max-w-140 mx-auto">
        Welcome to Durom&apos;s Touch Clinic! Your account has been created
        successfully. A confirmation email has been sent to{" "}
        <span className="font-semibold text-primary-deepblue">f@gmail.com</span>
        .
      </p>

      <div className="border border-slate-200 rounded-2xl py-8 px-4 mb-8">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-4">
          PAYMENT PROCESSED
        </p>
        <p className="text-[32px] font-bold text-primary-deepblue leading-tight mb-1">
          $49.00
        </p>
        <p className="text-[13px] text-slate-400">One-time registration fee</p>
      </div>

      <div className="flex flex-col gap-4">
        <Link href="/dashboard" className="w-full">
          <Button
            type="button"
            variant="primary"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-[10px] bg-primary-red hover:bg-[#c40300] text-white font-bold text-[15px] transition-colors duration-200 cursor-pointer"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        <Link
          href="/"
          className="text-[14px] font-medium text-primary-gray hover:text-primary-deepblue hover:underline py-2"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default Confirmation;
