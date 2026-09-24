import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/utils/storage";

export interface UpdateProfileDto {
  full_name?: string;
  phone?: string;
}

export interface UpdatePatientDto {
  date_of_birth?: string; // ISO-8601 date string, e.g. "1990-01-01"
  gender?: "male" | "female" | "other";
  address?: string;
  blood_group?: string; // e.g. "A+", "O-", etc.
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  next_of_kin_relationship?: string;
  passport_url?: string;
}

export type UpdateMyProfileDto = UpdateProfileDto & UpdatePatientDto;

export async function updateMyProfile(payload: UpdateMyProfileDto) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const userId = user.id;

  const {
    full_name,
    phone,
    date_of_birth,
    gender,
    address,
    blood_group,
    next_of_kin_name,
    next_of_kin_phone,
    next_of_kin_relationship,
    passport_url,
  } = payload;

  const profilePatch: UpdateProfileDto = {};
  if (full_name !== undefined) profilePatch.full_name = full_name;
  if (phone !== undefined) profilePatch.phone = phone;

  const patientPatch: UpdatePatientDto = {};
  if (date_of_birth !== undefined) patientPatch.date_of_birth = date_of_birth;
  if (gender !== undefined) patientPatch.gender = gender;
  if (address !== undefined) patientPatch.address = address;
  if (blood_group !== undefined) patientPatch.blood_group = blood_group;
  if (next_of_kin_name !== undefined)
    patientPatch.next_of_kin_name = next_of_kin_name;
  if (next_of_kin_phone !== undefined)
    patientPatch.next_of_kin_phone = next_of_kin_phone;
  if (next_of_kin_relationship !== undefined)
    patientPatch.next_of_kin_relationship = next_of_kin_relationship;
  if (passport_url !== undefined) patientPatch.passport_url = passport_url;

  // ── 3. Update `profiles` (only if there is something to update) ───────────
  let updatedProfile = null;
  if (Object.keys(profilePatch).length > 0) {
    const { data, error } = await supabase
      .from("profiles")
      .update(profilePatch)
      .eq("id", userId)
      .select("id, full_name, phone, role, avatar_url, created_at, updated_at")
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
    updatedProfile = data;
  }

  // ── 4. Update `patients` (only if there is something to update) ───────────
  let updatedPatient = null;
  if (Object.keys(patientPatch).length > 0) {
    const { data, error } = await supabase
      .from("patients")
      .update(patientPatch)
      .eq("id", userId)
      .select(
        "date_of_birth, gender, address, blood_group, next_of_kin_name, next_of_kin_phone, next_of_kin_relationship, passport_url, status, created_at, updated_at",
      )
      .single();

    if (error) {
      throw new Error(`Failed to update patient details: ${error.message}`);
    }
    updatedPatient = data;
  }

  // ── 5. If we only updated one of the two, fetch the other to return a
  //       complete bundle rather than partial data ───────────────────────────
  if (!updatedProfile) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role, avatar_url, created_at, updated_at")
      .eq("id", userId)
      .single();
    if (error) throw new Error(`Failed to fetch profile: ${error.message}`);
    updatedProfile = data;
  }

  if (!updatedPatient) {
    const { data, error } = await supabase
      .from("patients")
      .select(
        "date_of_birth, gender, address, blood_group, next_of_kin_name, next_of_kin_phone, next_of_kin_relationship, passport_url, status, created_at, updated_at",
      )
      .eq("id", userId)
      .single();
    // Admins won't have a patients row — treat that as null, not an error
    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch patient details: ${error.message}`);
    }
    updatedPatient = data ?? null;
  }

  // ── 6. Resolve passport_url to a signed URL if present ─────────────────────
  if (updatedPatient?.passport_url) {
    const rawPassport = updatedPatient.passport_url;
    const signed = rawPassport.startsWith("http")
      ? rawPassport
      : await getSignedUrl("passports", rawPassport);
    updatedPatient = { ...updatedPatient, passport_url: signed };
  }

  // ── 7. Return the unified bundle ──────────────────────────────────────────
  return {
    profile: updatedProfile,
    patient: updatedPatient,
  };
}

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

  const rawPassport = patientRow?.passport_url ?? null;
  const passportSignedUrl = rawPassport
    ? rawPassport.startsWith("http")
      ? rawPassport
      : await getSignedUrl("passports", rawPassport)
    : null;

  return {
    id: profile.id,
    email: user.user_metadata.email,
    email_verified: user.user_metadata.email_verified,
    phone_verified: user.user_metadata.phone_verified,
    full_name: profile.full_name,
    phone: profile.phone,
    role: profile.role,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    date_of_birth: patientRow?.date_of_birth ?? null,
    gender: patientRow?.gender ?? null,
    address: patientRow?.address ?? null,
    blood_group: patientRow?.blood_group ?? null,
    next_of_kin_name: patientRow?.next_of_kin_name ?? null,
    next_of_kin_phone: patientRow?.next_of_kin_phone ?? null,
    next_of_kin_relationship: patientRow?.next_of_kin_relationship ?? null,
    passport_url: passportSignedUrl,
    status: patientRow?.status ?? null,
  };
}

