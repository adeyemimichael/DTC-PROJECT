import { createClient } from "../supabase/server";

export async function getCurrentProfile() {
  const supabase = await createClient();

  // 1. Get the authenticated user from Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

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
        blood_group,
        next_of_kin_name,
        next_of_kin_phone,
        next_of_kin_relationship,
        passport_url,
        status,
        created_at,
        updated_at
      )
    `,
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;

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
