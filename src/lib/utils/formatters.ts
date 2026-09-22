/**
 * Formatting utilities for displaying data in UI
 */

/**
 * Format ISO date string to readable appointment format
 * @example "2026-06-03T10:30:00.000Z" -> "June 03, 2026 at 10:30 AM"
 */
export function formatAppointmentDate(isoString: string): string {
  const date = new Date(isoString);
  
  const dateStr = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
  
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  
  return `${dateStr} at ${timeStr}`;
}

/**
 * Format price to USD currency
 * @example 49 -> "$49.00"
 * @example 149.5 -> "$149.50"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "Naira",
  }).format(price);
}

/**
 * Format duration in minutes to readable string
 * @example 30 -> "30 min"
 * @example 60 -> "60 min"
 */
export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

/**
 * Check if appointment date is in the future
 * @param scheduledAt - ISO date string
 * @returns true if appointment is upcoming, false if past
 */
export function isUpcoming(scheduledAt: string): boolean {
  return new Date(scheduledAt) > new Date();
}
