import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase client
 * Use this in client components ('use client') for browser-side operations
 */
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
};
