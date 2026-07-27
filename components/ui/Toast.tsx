import React from "react";
import { Check, Clock, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "pending" | "error";

interface ToastProps {
  type: ToastType;
  message: string;
}

export function Toast({ type, message }: ToastProps) {
  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          bgClass: "bg-[#3BC15C]",
          icon: <Check className="w-5 h-5 text-white" strokeWidth={2.5} />,
        };
      case "pending":
        return {
          bgClass: "bg-[#F98D29]",
          icon: <Clock className="w-5 h-5 text-white" strokeWidth={2.5} />,
        };
      case "error":
        return {
          bgClass: "bg-[#F83D42]",
          icon: <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2.5} />,
        };
      default:
        return {
          bgClass: "bg-gray-800",
          icon: null,
        };
    }
  };

  const { bgClass, icon } = getToastConfig(type);

  return (
    <div
      className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg ${bgClass} text-white min-w-[340px]`}
      role="alert"
    >
      {icon}
      <span className="font-medium text-[1.1rem] tracking-wide">
        {message}
      </span>
    </div>
  );
}

// Example usage container for previewing all three states
export function ToastDemo() {
  return (
    <div className="flex flex-col gap-4 p-8 bg-white/50 rounded-2xl border border-gray-100">
      <Toast type="success" message="Appointment marked as completed" />
      <Toast type="pending" message="Appointment is pending" />
      <Toast type="error" message="Error scheduling appointment" />
    </div>
  );
}
