import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patient_id") || user.id;

    // RLS handles the access control. If the user is not admin,
    // they can only fetch their own vitals regardless of what's passed.
    const { data: vitals, error: vitalsError } = await supabase
      .from("vitals")
      .select("*")
      .eq("patient_id", patientId)
      .order("recorded_at", { ascending: false });

    if (vitalsError) {
      return NextResponse.json({ error: vitalsError.message }, { status: 500 });
    }

    return NextResponse.json({ data: vitals }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user is an admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    const body = await request.json();
    const {
      patient_id,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      heart_rate_bpm,
      temperature_c,
      weight_kg,
      height_cm,
      spo2_percent,
      blood_sugar_mmol,
      notes,
    } = body;

    if (isAdmin) {
      if (!patient_id) {
        return NextResponse.json(
          { error: "Admin must provide a patient_id" },
          { status: 400 },
        );
      }
    } else {
      if (patient_id && patient_id !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized to add vitals for this patient" },
          { status: 403 },
        );
      }
    }

    const finalPatientId = isAdmin ? patient_id : user.id;

    const { data: vital, error: vitalError } = await supabase
      .from("vitals")
      .insert([
        {
          patient_id: finalPatientId,
          blood_pressure_systolic,
          blood_pressure_diastolic,
          heart_rate_bpm,
          temperature_c,
          weight_kg,
          height_cm,
          spo2_percent,
          blood_sugar_mmol,
          notes,
        },
      ])
      .select()
      .single();

    if (vitalError) {
      return NextResponse.json({ error: vitalError.message }, { status: 500 });
    }

    return NextResponse.json({ data: vital }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
