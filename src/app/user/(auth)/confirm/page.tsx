"use client";

import { Button } from "@/components/ui";
import { ArrowRight, Check, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";

const ConfirmationContent = () => {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setErrorMessage("No payment reference found.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Payment verification failed.");
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(
          err.message || "An error occurred during verification.",
        );
      }
    };

    verifyPayment();
  }, [reference]);

  if (status === "loading") {
    return (
      <div className="text-center py-12 px-6 md:px-10 bg-white w-full max-w-140 mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-primary-deepblue animate-spin mb-4" />
        <h2 className="text-[24px] font-bold text-primary-deepblue tracking-tight">
          Verifying your payment...
        </h2>
        <p className="text-[15px] text-primary-gray mt-2">
          Please wait while we confirm your transaction. Do not close this page.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center py-12 px-6 md:px-10 bg-white w-full max-w-140 mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-600" strokeWidth={2.5} />
        </div>
        <h2 className="text-[24px] font-bold text-primary-deepblue tracking-tight mb-2">
          Payment Verification Failed
        </h2>
        <p className="text-[15px] text-red-600 font-medium mb-6">
          {errorMessage}
        </p>
        <Link href="/user/register" className="w-full max-w-[250px]">
          <Button
            type="button"
            variant="outline"
            className="w-full py-4 rounded-[10px] border border-slate-200 text-primary-deepblue font-bold text-[15px] transition-colors duration-200"
          >
            Try Again
          </Button>
        </Link>
      </div>
    );
  }

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
        successfully and your payment has been confirmed.
      </p>

      <div className="border border-slate-200 rounded-2xl py-8 px-4 mb-8">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-4">
          PAYMENT PROCESSED
        </p>
        <p className="text-[32px] font-bold text-primary-deepblue leading-tight mb-1">
          $49.00
        </p>
        <p className="text-[13px] text-slate-400">One-time registration fee</p>
        <p className="text-[12px] font-mono text-primary-gray mt-2 bg-slate-50 py-1 rounded inline-block px-2 border border-slate-100">
          Ref: {reference?.slice(0, 5)}...{reference?.slice(-4)}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Link href="/user/overview" className="w-full">
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

const Confirmation = () => {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12 px-6 bg-white w-full max-w-140 mx-auto flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-primary-deepblue animate-spin" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
};

export default Confirmation;
