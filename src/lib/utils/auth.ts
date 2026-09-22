import { createClient } from "../supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * Returns a bundle of the currently authenticated user's:
 *  - auth   → the Supabase Auth user object (id, email, metadata, etc.)
 *  - profile → their row from the `profiles` table (full_name, phone, role, avatar_url …)
 *  - patient → their row from the `patients` table (dob, gender, address, status …)
 *              Will be null if the user is an admin (admins have no patients row).
 *
 * Returns null if the user is not authenticated.
 */
export async function getCurrentProfile() {
  const supabase = await createClient();

  // 1. Get the authenticated user from Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  // 2. Fetch the profile row plus its linked patient row in a single query.
  //    Because patients.id is a FK to profiles.id (1:1), Supabase lets us
  //    embed it as a nested object using the foreign-key relationship.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      phone,
      role,
      avatar_url,
      created_at,
      updated_at,
      patients (
        date_of_birth,
        gender,
        address,
        next_of_kin_name,
        next_of_kin_phone,
        passport_url,
        status,
        created_at,
        updated_at
      )
    `
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;

  // 3. Flatten into a clean bundle.
  //    `patients` comes back as an array from Supabase (even for 1:1 FKs)
  //    so we pull the first element, or null for admins who have no patient row.
  const patientRow = Array.isArray(profile.patients)
    ? (profile.patients[0] ?? null)
    : (profile.patients ?? null);

  return {
    auth: user,
    profile: {
      id: profile.id,
      full_name: profile.full_name,
      phone: profile.phone,
      role: profile.role,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    },
    patient: patientRow,
  };
}

