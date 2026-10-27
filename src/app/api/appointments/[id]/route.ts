import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/appointments/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { id } = await params;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select("*, services(*), profiles:clinician_id(id, full_name, avatar_url, phone)")
      .eq("id", id)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: appointment }, { status: 200 });
  } catch (err: any) {
    console.error("GET appointment by id error:", err);
    return NextResponse.json(
      { error: err.message || "Invalid request" },
      { status: 400 },
    );
  }
}

// PUT or PATCH /api/appointments/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { id } = await params;

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
      status,
      completion_note,
      completion_note_id,
      meeting_link,
      cancellation_reason,
      scheduled_at,
    } = body;

    const adminClient = createAdminClient();

    // 1. If user is patient, verify ownership & only allow cancellation
    if (!isAdmin) {
      const { data: existingApt } = await adminClient
        .from("appointments")
        .select("id, patient_id, status")
        .eq("id", id)
        .single();

      if (!existingApt || existingApt.patient_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (status !== "cancelled") {
        return NextResponse.json(
          { error: "Patients are only permitted to cancel their appointments." },
          { status: 403 },
        );
      }

      // Update via admin client to satisfy RLS
      const { data: updatedApt, error: cancelError } = await adminClient
        .from("appointments")
        .update({
          status: "cancelled",
          cancelled_by: "patient",
          cancellation_reason: cancellation_reason || "Cancelled by patient",
        })
        .eq("id", id)
        .select("*, services(*)")
        .single();

      if (cancelError) {
        return NextResponse.json(
          { error: cancelError.message },
          { status: 500 },
        );
      }

      return NextResponse.json({ data: updatedApt }, { status: 200 });
    }

    // 2. Admin update (can change status, meeting link, notes, etc.)
    const updatePayload: Record<string, any> = {};

    if (status) updatePayload.status = status;
    if (meeting_link !== undefined) updatePayload.meeting_link = meeting_link;
    if (completion_note !== undefined) updatePayload.completion_note = completion_note;
    if (completion_note_id !== undefined) updatePayload.completion_note_id = completion_note_id;
    if (scheduled_at) updatePayload.scheduled_at = scheduled_at;

    if (status === "cancelled") {
      updatePayload.cancelled_by = "admin";
      updatePayload.cancellation_reason = cancellation_reason || "Cancelled by clinic";
    }

    const { data: updatedAppointment, error: updateError } = await adminClient
      .from("appointments")
      .update(updatePayload)
      .eq("id", id)
      .select("*, services(*), profiles:clinician_id(id, full_name)")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: updatedAppointment }, { status: 200 });
  } catch (err: any) {
    console.error("PUT appointment error:", err);
    return NextResponse.json(
      { error: err.message || "Invalid request" },
      { status: 400 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return PUT(request, context);
}
