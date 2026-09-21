"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import toast from "react-hot-toast";

export default function PaymentRecoveryPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/payments?purpose=registration");
      const result = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/user/login");
          return;
        }
        throw new Error(result.error || "Failed to fetch payments");
      }

      setPayments(result.data || []);
    } catch (err: any) {
      toast.error("Failed to fetch payment attempts.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevalidate = async (reference: string) => {
    try {
      setIsActionLoading(reference);
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment not successful yet.");
      }

      toast.success("Payment verified successfully!");
      router.push("/user/overview");
    } catch (err: any) {
      toast.error(err.message || "Failed to verify payment.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleCompletePayment = (accessCode: string) => {
    if (accessCode) {
      window.location.href = `https://checkout.paystack.com/${accessCode}`;
    } else {
      toast.error("Invalid payment code. Please reinitialize payment.");
    }
  };

  const handleProceedToPayment = async () => {
    try {
      setIsActionLoading("new");
      const res = await fetch("/api/payments/reinitialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize payment.");
      }

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "An error occurred while logging out. Please try again.",
        );
      }
      toast.success("Logged out successfully!", { id: toastId });
      router.replace("/user/login");
    } catch (err: any) {
      toast.error(
        err.message || "An error occurred while logging out. Please try again.",
        { id: toastId },
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-[2.5rem] font-bold text-gray-900 tracking-tight mb-2">
            Complete Your Registration
          </h1>
          <p className="text-secondary-600 text-lg">
            Your payment is required to activate your account and access the
            dashboard.
          </p>
        </div>

        <Card className="p-6 md:p-8 bg-white shadow-xl shadow-brand-blue/5 border-none">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <svg
                className="animate-spin h-8 w-8 text-brand-blue"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            </div>
          ) : payments.length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Payment Attempts
              </h3>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border border-gray-100 rounded-xl p-5 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        {new Date(payment.created_at).toLocaleDateString()} at{" "}
                        {new Date(payment.created_at).toLocaleTimeString()}
                      </p>
                      <p className="font-medium text-gray-900">
                        {payment.currency} {payment.amount.toLocaleString()}
                      </p>
                      <p className="text-sm mt-1">
                        Status:{" "}
                        <span className="font-semibold text-amber-600 uppercase text-xs">
                          {payment.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleRevalidate(payment.paystack_reference)
                        }
                        disabled={isActionLoading !== null}
                        className="whitespace-nowrap"
                      >
                        {isActionLoading === payment.paystack_reference
                          ? "Verifying..."
                          : "Revalidate"}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() =>
                          handleCompletePayment(payment.paystack_access_code)
                        }
                        disabled={isActionLoading !== null}
                        className="whitespace-nowrap"
                      >
                        Pay Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-gray-500 border-transparent hover:bg-gray-100"
                >
                  Logout
                </Button>
                <Button
                  variant="primary"
                  onClick={handleProceedToPayment}
                  disabled={isActionLoading !== null}
                >
                  {isActionLoading === "new"
                    ? "Processing..."
                    : "Start New Payment"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-brand-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Payment Records Found
              </h3>
              <p className="text-gray-500 mb-6">
                Please proceed to make your registration payment to activate
                your account.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
                <Button
                  variant="primary"
                  onClick={handleProceedToPayment}
                  disabled={isActionLoading !== null}
                >
                  {isActionLoading === "new"
                    ? "Processing..."
                    : "Proceed to Payment"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
