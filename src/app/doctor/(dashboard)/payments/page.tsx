"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";

type PaymentStatus = "all" | "success" | "pending" | "failed";
type DateRange = "all" | "this-month" | "last-30-days";

interface Transaction {
  id: string;
  reference: string;
  appointmentId: string;
  patientName: string;
  serviceName: string;
  amount: number;
  status: string;
  createdAt: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
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

function isInDateRange(dateValue: string, range: DateRange): boolean {
  if (range === "all") return true;

  const date = new Date(dateValue);
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

export default function DoctorPaymentsPage() {
  const { appointments, isLoading, error, fetchAppointments } =
    useAppointments({ autoFetch: true });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");

  const transactions = useMemo(() => {
    const result: Transaction[] = [];

    for (const appointment of appointments) {
      for (const payment of appointment.payments ?? []) {
        result.push({
          id: payment.id,
          reference: payment.paystack_reference,
          appointmentId: appointment.id,
          patientName: appointment.patient?.full_name || "Patient",
          serviceName: appointment.services?.name || "Appointment",
          amount: Number(payment.amount) || 0,
          status: payment.status,
          createdAt: payment.created_at || appointment.created_at,
        });
      }
    }

    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [appointments]);

  const summary = useMemo(() => {
    const successful = transactions.filter(
      (transaction) => transaction.status === "success",
    );
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    return {
      monthRevenue: successful
        .filter((transaction) => new Date(transaction.createdAt) >= monthStart)
        .reduce((total, transaction) => total + transaction.amount, 0),
      successfulCount: successful.length,
      pendingCount: transactions.filter(
        (transaction) => transaction.status === "pending",
      ).length,
      failedCount: transactions.filter((transaction) =>
        ["failed", "abandoned"].includes(transaction.status),
      ).length,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          transaction.reference,
          transaction.appointmentId,
          transaction.patientName,
          transaction.serviceName,
        ].some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "failed"
          ? ["failed", "abandoned"].includes(transaction.status)
          : transaction.status === statusFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        isInDateRange(transaction.createdAt, dateRange)
      );
    });
  }, [dateRange, search, statusFilter, transactions]);

  const summaryCards = [
    {
      label: "Revenue this month",
      value: formatCurrency(summary.monthRevenue),
      detail: "From successful payments",
      icon: Wallet,
      iconStyle: "bg-blue-50 text-blue-700",
    },
    {
      label: "Successful payments",
      value: summary.successfulCount.toLocaleString(),
      detail: "All time",
      icon: CheckCircle2,
      iconStyle: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Awaiting payment",
      value: summary.pendingCount.toLocaleString(),
      detail: "Pending transactions",
      icon: Clock3,
      iconStyle: "bg-amber-50 text-amber-700",
    },
    {
      label: "Failed payments",
      value: summary.failedCount.toLocaleString(),
      detail: "Failed or abandoned",
      icon: XCircle,
      iconStyle: "bg-rose-50 text-rose-700",
    },
  ];

  const statusTabs: { label: string; value: PaymentStatus }[] = [
    { label: "All transactions", value: "all" },
    { label: "Paid", value: "success" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-red">
            Practice finances
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Payments &amp; Revenue
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Track appointment payments, find a transaction, and review its
            current status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchAppointments()}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh transactions
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
                  <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
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
              <h2 className="text-lg font-bold text-slate-900">
                Transaction history
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search by patient, transaction reference, service, or
                appointment ID.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:min-w-72">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <span className="sr-only">Search transactions</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transactions"
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
            aria-label="Filter transactions by payment status"
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
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div
            className="m-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
            role="alert"
          >
            <p className="font-semibold">Transactions could not be loaded.</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={() => void fetchAppointments()}
              className="mt-3 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : isLoading && transactions.length === 0 ? (
          <div className="space-y-3 p-5" aria-label="Loading transactions">
            {[0, 1, 2, 3].map((row) => (
              <div
                key={row}
                className="h-14 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Search className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              {transactions.length === 0
                ? "No transactions yet"
                : "No matching transactions"}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {transactions.length === 0
                ? "Appointment payments will appear here once they are recorded."
                : "Try another search or adjust your status and date filters."}
            </p>
            {transactions.length > 0 && (
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
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Patient / service
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Transaction
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {transaction.patientName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {transaction.serviceName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs font-semibold text-slate-700">
                        {transaction.reference}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Appt. {transaction.appointmentId.slice(0, 8)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={transaction.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              transactions
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
