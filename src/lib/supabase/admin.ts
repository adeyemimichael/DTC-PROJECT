import { createClient } from "@supabase/supabase-js";

export const createAdminClient = () => {
  const supabaseurl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseserviceKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseurl || !supabaseserviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY env vars",
    );
  }

  return createClient(supabaseurl, supabaseserviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
};
