"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";

type PaymentStatus = "all" | "success" | "pending" | "failed";
type DateRange = "all" | "this-month" | "last-30-days";

interface PatientPayment {
  id: string;
  purpose: string;
  related_appointment_id: string | null;
  amount: number;
  currency: string;
  paystack_reference: string;
  paystack_access_code: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatCurrencyTotals(payments: PatientPayment[]): string {
  const totals = new Map<string, number>();
  for (const payment of payments) {
    const currency = payment.currency || "NGN";
    totals.set(
      currency,
      (totals.get(currency) || 0) + (Number(payment.amount) || 0),
    );
  }

  return [...totals.entries()]
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(" · ") || formatCurrency(0, "NGN");
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getPurposeLabel(purpose: string): string {
  switch (purpose) {
    case "registration":
      return "Registration";
    case "appointment":
      return "Appointment";
    case "follow_up":
      return "Follow-up";
    default:
      return "Other payment";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "success":
      return "Paid";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    case "abandoned":
      return "Abandoned";
    default:
      return status.replaceAll("_", " ");
  }
}

function isInDateRange(value: string, range: DateRange): boolean {
  if (range === "all") return true;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  if (range === "this-month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  return date >= thirtyDaysAgo && date <= now;
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "success"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : status === "pending"
        ? "bg-amber-50 text-amber-700 ring-amber-600/20"
        : "bg-rose-50 text-rose-700 ring-rose-600/20";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {getStatusLabel(status)}
    </span>
  );
}

export default function PatientPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PatientPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");

  useEffect(() => {
    let isCurrent = true;

    async function loadPayments() {
      try {
        const response = await fetch("/api/payments");
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/user/login");
            return;
          }
          throw new Error(result.error || "Failed to fetch your payments.");
        }

        if (!Array.isArray(result.data)) {
          throw new Error(
            "The payments response was not in the expected format.",
          );
        }

        if (isCurrent) {
          setError(null);
          setPayments(result.data);
        }
      } catch (fetchError: unknown) {
        if (isCurrent) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to fetch your payments.",
          );
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void loadPayments();
    return () => {
      isCurrent = false;
    };
  }, [refreshVersion, router]);

  const summary = useMemo(() => {
    const successful = payments.filter(
      (payment) => payment.status === "success",
    );
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const paidThisMonth = successful.filter(
      (payment) =>
        new Date(payment.paid_at || payment.created_at) >= monthStart,
    );

    return {
      totalPaid: formatCurrencyTotals(successful),
      paidThisMonth: formatCurrencyTotals(paidThisMonth),
      pendingCount: payments.filter(
        (payment) => payment.status === "pending",
      ).length,
      unsuccessfulCount: payments.filter((payment) =>
        ["failed", "abandoned"].includes(payment.status),
      ).length,
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          payment.paystack_reference,
          payment.related_appointment_id || "",
          getPurposeLabel(payment.purpose),
        ].some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "failed"
          ? ["failed", "abandoned"].includes(payment.status)
          : payment.status === statusFilter);
      const date = payment.paid_at || payment.created_at;

      return (
        matchesSearch &&
        matchesStatus &&
        isInDateRange(date, dateRange) 
      );
    });
  }, [dateRange, payments, search, statusFilter]);

  const handleRetryPayment = async (payment: PatientPayment) => {
    if (payment.paystack_access_code) {
      window.location.assign(
        `https://checkout.paystack.com/${payment.paystack_access_code}`,
      );
      return;
    }

    if (!payment.related_appointment_id) {
      setError(
        "This payment cannot be restarted from here. Please contact the clinic for help.",
      );
      return;
    }

    setIsRetrying(payment.id);
    setError(null);
    try {
      const response = await fetch("/api/payments/reinitialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: payment.related_appointment_id,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to restart payment.");
      }
      if (!result.authorization_url) {
        throw new Error("No checkout link was returned. Please try again.");
      }

      window.location.assign(result.authorization_url);
    } catch (retryError: unknown) {
      setError(
        retryError instanceof Error
          ? retryError.message
          : "Failed to restart payment.",
      );
      setIsRetrying(null);
    }
  };

  const handleVerifyPayment = async (payment: PatientPayment) => {
    setIsVerifying(payment.id);
    setError(null);
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: payment.paystack_reference }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to verify payment.");
      }

      setIsLoading(true);
      setRefreshVersion((version) => version + 1);
    } catch (verificationError: unknown) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "Failed to verify payment.",
      );
    } finally {
      setIsVerifying(null);
    }
  };

  const summaryCards = [
    {
      label: "Total paid",
      value: summary.totalPaid,
      detail: "Across all successful payments",
      icon: Wallet,
      iconStyle: " text-blue-700",
    },
    {
      label: "Paid this month",
      value: summary.paidThisMonth,
      detail: "Successful payments this month",
      icon: CheckCircle2,
      iconStyle: " text-emerald-700",
    },
    {
      label: "Awaiting payment",
      value: summary.pendingCount.toLocaleString(),
      detail: "Pending transactions",
      icon: Clock3,
      iconStyle: "text-amber-700",
    },
    {
      label: "Unsuccessful",
      value: summary.unsuccessfulCount.toLocaleString(),
      detail: "Failed or abandoned",
      icon: XCircle,
      iconStyle: " text-rose-700",
    },
  ];

  const statusTabs: { label: string; value: PaymentStatus }[] = [
    { label: "All payments", value: "all" },
    { label: "Paid", value: "success" },
    { label: "Pending", value: "pending" },
    { label: "Unsuccessful", value: "failed" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Payments
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Review your payment history, check transaction statuses, and find a
            payment when you need it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setRefreshVersion((version) => version + 1);
          }}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh payments
        </button>
      </div>

      <section
        aria-label="Payment summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                    {card.value}
                  </p>
                </div>
                <span className={`rounded-xl p-2.5 ${card.iconStyle}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">{card.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Payment history
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search by payment reference, purpose, or appointment ID.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:min-w-72">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <span className="sr-only">Search payments</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search payments"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/10"
                />
              </label>
              <label>
                <span className="sr-only">Filter by date</span>
                <select
                  value={dateRange}
                  onChange={(event) =>
                    setDateRange(event.target.value as DateRange)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/10 sm:w-auto"
                >
                  <option value="all">Any time</option>
                  <option value="this-month">This month</option>
                  <option value="last-30-days">Last 30 days</option>
                </select>
              </label>
            </div>
          </div>

          <div
            className="mt-5 flex gap-2 overflow-x-auto"
            role="group"
            aria-label="Filter payments by status"
          >
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-pressed={statusFilter === tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === tab.value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div
            className="m-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {isLoading && payments.length === 0 ? (
          <div className="space-y-3 p-5" aria-label="Loading payments">
            {[0, 1, 2, 3].map((row) => (
              <div
                key={row}
                className="h-14 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              {payments.length === 0
                ? "No payments yet"
                : "No matching payments"}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {payments.length === 0
                ? "Your payments will appear here after you make a transaction."
                : "Try another search or adjust your status and date filters."}
            </p>
            {payments.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setDateRange("all");
                }}
                className="mt-4 text-sm font-semibold text-primary-blue hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Reference
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {getPurposeLabel(payment.purpose)}
                      </p>
                      {payment.related_appointment_id && (
                        <p className="mt-1 text-xs text-slate-500">
                          Appt. {payment.related_appointment_id.slice(0, 8)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                      {payment.paystack_reference}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(payment.paid_at || payment.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        Number(payment.amount) || 0,
                        payment.currency || "NGN",
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {payment.status === "success" ? (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                payment.related_appointment_id
                                  ? "/user/appointments"
                                  : "/user/overview",
                              )
                            }
                            className="inline-flex items-center whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-primary-blue transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/30"
                          >
                            {payment.related_appointment_id
                              ? "View appointments"
                              : "View account"}
                          </button>
                        ) : (
                          <>
                            {payment.status === "pending" && (
                              <button
                                type="button"
                                onClick={() =>
                                  void handleVerifyPayment(payment)
                                }
                                disabled={
                                  isRetrying !== null || isVerifying !== null
                                }
                                className="inline-flex items-center whitespace-nowrap rounded-full border border-amber-600/20 bg-amber-50 px-3 py-1.5 text-xs items-center font-semibold text-amber-700 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/20 disabled:cursor-wait disabled:opacity-60"
                              >
                                {isVerifying === payment.id
                                  ? "Checking..."
                                  : "Verify"}
                              </button>
                            )}
                            {payment.purpose !== "registration" && (
                              <button
                                type="button"
                                onClick={() => void handleRetryPayment(payment)}
                                disabled={
                                  isRetrying !== null || isVerifying !== null
                                }
                                className="inline-flex items-center whitespace-nowrap rounded-full border border-red-100 bg-primary-red px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/20 disabled:cursor-wait disabled:opacity-60"
                              >
                                {isRetrying === payment.id
                                  ? "Opening checkout..."
                                  : "Retry payment"}
                              </button>
                            )}
                            {payment.purpose === "registration" && (
                              <a
                                href="/user/payment-recovery"
                                className="whitespace-nowrap text-sm font-semibold text-primary-blue hover:underline"
                              >
                                Continue payment
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
              Showing {filteredPayments.length} of {payments.length} payments
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
