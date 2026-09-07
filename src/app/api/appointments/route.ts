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
    const patientId = searchParams.get("patient_id");

    // Start a base query
    let query = supabase
      .from("appointments")
      .select("*, services(*), profiles:clinician_id(full_name)")
      .order("scheduled_at", { ascending: true });

    // If a specific patient is requested, filter by it.
    // Otherwise, RLS ensures that non-admins only see their own appointments anyway.
    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    const { data: appointments, error: appointmentsError } = await query;

    if (appointmentsError) {
      return NextResponse.json(
        { error: appointmentsError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: appointments }, { status: 200 });
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    const body = await request.json();
    const {
      patient_id,
      clinician_id,
      service_id,
      scheduled_at,
      reason,
      patient_upload_id,
    } = body;

    const finalPatientId = isAdmin ? patient_id || user.id : user.id;

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert([
        {
          patient_id: finalPatientId,
          clinician_id,
          service_id,
          scheduled_at,
          reason,
          patient_upload_id,
          booked_by: isAdmin ? "admin" : "patient",
        },
      ])
      .select()
      .single();

    if (appointmentError) {
      return NextResponse.json(
        { error: appointmentError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: appointment }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
