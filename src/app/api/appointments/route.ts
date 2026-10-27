import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bookAppointment } from "@/lib/services/appointment.service";

// GET /api/appointments
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
    const status = searchParams.get("status");
    const upcoming = searchParams.get("upcoming");

    // Start a base query
    let query = supabase
      .from("appointments")
      .select("*, services(*), profiles:clinician_id(id, full_name, avatar_url, phone)")
      .order("scheduled_at", { ascending: true });

    // If a specific patient is requested, filter by it.
    // Otherwise, RLS ensures non-admins only see their own appointments anyway.
    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (upcoming === "true") {
      query = query
        .gte("scheduled_at", new Date().toISOString())
        .not("status", "in", '("cancelled","declined")');
    }

    const { data: appointments, error: appointmentsError } = await query;

    if (appointmentsError) {
      return NextResponse.json(
        { error: appointmentsError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: appointments }, { status: 200 });
  } catch (err: any) {
    console.error("GET appointments error:", err);
    return NextResponse.json(
      { error: err.message || "Invalid request" },
      { status: 400 },
    );
  }
}

// POST /api/appointments
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
      callback_url,
    } = body;

    if (!service_id || !scheduled_at) {
      return NextResponse.json(
        { error: "service_id and scheduled_at are required." },
        { status: 400 },
      );
    }

    const finalPatientId = isAdmin ? patient_id || user.id : user.id;

    // Use appointment service to handle conflict check, booking & Paystack integration
    const result = await bookAppointment({
      patientId: finalPatientId,
      userEmail: user.email || "",
      serviceId: service_id,
      scheduledAt: scheduled_at,
      reason,
      patientUploadId: patient_upload_id,
      clinicianId: clinician_id,
      isAdmin,
      callbackUrl: callback_url,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.appointment,
        paymentUrl: result.paymentUrl,
        reference: result.reference,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("POST appointment error:", err);
    return NextResponse.json(
      { error: err.message || "Invalid request" },
      { status: 400 },
    );
  }
}
