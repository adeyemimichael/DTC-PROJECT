import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  try {
    // 1. Authenticate the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch the requesting user's role to verify permissions
    const { data: requestorProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = requestorProfile?.role === "admin";

    // 3. Authorization check
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Admins only" },
        { status: 403 },
      );
    }

    // 4. Fetch profiles that strictly have a patient record
    const { data: profilesWithPatients, error: fetchError } =
      await supabase.from("profiles").select(`
        id,
        full_name,
        phone,
        role,
        avatar_url,
        created_at,
        updated_at,
        patients!inner (
          date_of_birth,
          gender,
          address,
          blood_group,
          next_of_kin_name,
          next_of_kin_phone,
          next_of_kin_relationship,
          passport_url,
          status
        )
      `);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // 5. Flatten the data structure
    const flattenedPatients = profilesWithPatients.map((profile) => {
      const patientData = Array.isArray(profile.patients)
        ? profile.patients[0]
        : profile.patients;

      const { patients, ...profileDetails } = profile;

      return {
        ...profileDetails,
        ...patientData,
      };
    });

    return NextResponse.json({ data: flattenedPatients }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
