import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

   
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // Fetch patients table for additional demographics/contact
    const { data: patient } = await supabase
      .from("patients")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const combinedProfile = {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || null,
      phone: profile?.phone || user.user_metadata?.phone || null,
      role: profile?.role || "patient",
      avatar_url: profile?.avatar_url || patient?.passport_url || null,
      date_of_birth: patient?.date_of_birth || null,
      gender: patient?.gender || null,
      blood_group: patient?.blood_group || null,
      address: patient?.address || null,
      next_of_kin_name: patient?.next_of_kin_name || null,
      next_of_kin_phone: patient?.next_of_kin_phone || null,
      created_at: profile?.created_at || user.created_at,
      updated_at: profile?.updated_at || new Date().toISOString(),
    };

    return NextResponse.json({ data: combinedProfile }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      full_name,
      phone,
      avatar_url,
      date_of_birth,
      gender,
      blood_group,
      address,
      next_of_kin_name,
      next_of_kin_phone,
    } = body;

    // 1. Update profiles table if profile fields provided
    const profileUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (full_name !== undefined) profileUpdates.full_name = full_name;
    if (phone !== undefined) profileUpdates.phone = phone;
    if (avatar_url !== undefined) profileUpdates.avatar_url = avatar_url;

    let updatedProfile = null;
    if (Object.keys(profileUpdates).length > 1) {
      const { data, error: profileErr } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", user.id)
        .select()
        .maybeSingle();

      if (profileErr) {
        console.error("Profile update error:", profileErr);
      } else {
        updatedProfile = data;
      }
    }

    // 2. Upsert patients table if patient fields provided
    const patientUpdates: Record<string, any> = {
      id: user.id,
      updated_at: new Date().toISOString(),
    };
    if (date_of_birth !== undefined) patientUpdates.date_of_birth = date_of_birth || null;
    if (gender !== undefined) patientUpdates.gender = gender ? gender.toLowerCase() : null;
    if (blood_group !== undefined) patientUpdates.blood_group = blood_group || null;
    if (address !== undefined) patientUpdates.address = address || null;
    if (next_of_kin_name !== undefined) patientUpdates.next_of_kin_name = next_of_kin_name || null;
    if (next_of_kin_phone !== undefined) patientUpdates.next_of_kin_phone = next_of_kin_phone || null;
    if (avatar_url !== undefined) patientUpdates.passport_url = avatar_url || null;

    let updatedPatient = null;
    if (Object.keys(patientUpdates).length > 2) {
      const { data, error: patientErr } = await supabase
        .from("patients")
        .upsert(patientUpdates)
        .select()
        .maybeSingle();

      if (patientErr) {
        console.error("Patient update error:", patientErr);
      } else {
        updatedPatient = data;
      }
    }

    // Return combined object
    const finalResult = {
      id: user.id,
      email: user.email,
      full_name: updatedProfile?.full_name ?? full_name ?? null,
      phone: updatedProfile?.phone ?? phone ?? null,
      role: updatedProfile?.role ?? "patient",
      avatar_url: updatedProfile?.avatar_url ?? updatedPatient?.passport_url ?? avatar_url ?? null,
      date_of_birth: updatedPatient?.date_of_birth ?? date_of_birth ?? null,
      gender: updatedPatient?.gender ?? gender ?? null,
      blood_group: updatedPatient?.blood_group ?? blood_group ?? null,
      address: updatedPatient?.address ?? address ?? null,
      next_of_kin_name: updatedPatient?.next_of_kin_name ?? next_of_kin_name ?? null,
      next_of_kin_phone: updatedPatient?.next_of_kin_phone ?? next_of_kin_phone ?? null,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ data: finalResult }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
