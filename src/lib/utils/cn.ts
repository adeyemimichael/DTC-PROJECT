/**
 * Utility function to conditionally join classNames together.
 * Extremely useful for toggling Tailwind classes dynamically.
 * 
 * @param classes List of classNames (strings, booleans, undefined, null)
 * @returns Cleaned space-separated className string
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ').trim();
}
