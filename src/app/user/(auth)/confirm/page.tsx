"use client";

import { Button } from "@/components/ui";
import { ArrowRight, Check, Calendar, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";

const ConfirmationContent = () => {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const queryPurpose = searchParams.get("purpose");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentData, setPaymentData] = useState<any>(null);

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
          setPaymentData(data.payment || null);
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

  // Determine if this confirmation is for an appointment or registration
  const isAppointment =
    queryPurpose === "appointment" ||
    paymentData?.purpose === "appointment" ||
    reference?.startsWith("APP-");

  if (status === "loading") {
    return (
      <div className="text-center py-12 px-6 md:px-10 bg-white w-full max-w-140 mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-primary-deepblue animate-spin mb-4" />
        <h2 className="text-[24px] font-bold text-primary-deepblue tracking-tight">
          Verifying your payment...
        </h2>
        <p className="text-[15px] text-primary-gray mt-2">
          Please wait while we confirm your transaction with Paystack. Do not close this page.
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
        <Link
          href={isAppointment ? "/user/appointments" : "/user/register"}
          className="w-full max-w-[250px]"
        >
          <Button
            type="button"
            variant="outline"
            className="w-full py-4 rounded-[10px] border border-slate-200 text-primary-deepblue font-bold text-[15px] transition-colors duration-200"
          >
            {isAppointment ? "Back to Appointments" : "Try Again"}
          </Button>
        </Link>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUCCESS VIEW: APPOINTMENT CONFIRMATION
  // ─────────────────────────────────────────────────────────────────────────────
  if (isAppointment) {
    return (
      <div className="text-center py-12 px-6 md:px-10 bg-white w-full max-w-140 mx-auto animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
        </div>
        <h2 className="text-[28px] md:text-[32px] font-bold text-primary-deepblue mb-3 tracking-tight">
          Appointment Payment Received!
        </h2>
        <p className="text-[15px] text-primary-gray mb-8 leading-relaxed max-w-140 mx-auto">
          Your consultation payment has been verified successfully. Your appointment is now awaiting approval from the doctor.
        </p>

        <div className="border border-slate-200 rounded-2xl py-8 px-4 mb-8 bg-slate-50/50">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-3">
            PAYMENT CONFIRMED
          </p>
          <p className="text-[32px] font-bold text-primary-deepblue leading-tight mb-1">
            {paymentData?.amount
              ? `NGN ${Number(paymentData.amount).toLocaleString()}`
              : "Consultation Fee"}
          </p>
          <p className="text-[13px] text-slate-400 font-medium">
            Telehealth / Clinic Consultation
          </p>
          <p className="text-[12px] font-mono text-primary-gray mt-3 bg-white py-1 rounded inline-block px-3 border border-slate-200">
            Ref: {reference?.slice(0, 7)}...{reference?.slice(-6)}
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          <Link href="/user/appointments" className="w-full">
            <Button
              type="button"
              variant="primary"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary-red hover:bg-[#c40300] text-white font-bold text-[15px] transition-colors duration-200 cursor-pointer shadow-sm"
            >
              <Calendar className="w-5 h-5" />
              View My Appointments
            </Button>
          </Link>
          <Link
            href="/user/overview"
            className="text-[14px] font-semibold text-primary-gray hover:text-primary-deepblue hover:underline py-2"
          >
            Go to Dashboard Overview
          </Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUCCESS VIEW: PATIENT REGISTRATION CONFIRMATION
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="text-center py-12 px-6 md:px-10 bg-white w-full max-w-140 mx-auto animate-in fade-in duration-300">
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

      <div className="border border-slate-200 rounded-2xl py-8 px-4 mb-8 bg-slate-50/50">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-3">
          PAYMENT PROCESSED
        </p>
        <p className="text-[32px] font-bold text-primary-deepblue leading-tight mb-1">
          {paymentData?.amount
            ? `NGN ${Number(paymentData.amount).toLocaleString()}`
            : "NGN 69,000"}
        </p>
        <p className="text-[13px] text-slate-400 font-medium">One-time registration fee</p>
        <p className="text-[12px] font-mono text-primary-gray mt-3 bg-white py-1 rounded inline-block px-3 border border-slate-200">
          Ref: {reference?.slice(0, 5)}...{reference?.slice(-4)}
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        <Link href="/user/overview" className="w-full">
          <Button
            type="button"
            variant="primary"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary-red hover:bg-[#c40300] text-white font-bold text-[15px] transition-colors duration-200 cursor-pointer shadow-sm"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        <Link
          href="/"
          className="text-[14px] font-semibold text-primary-gray hover:text-primary-deepblue hover:underline py-2"
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
