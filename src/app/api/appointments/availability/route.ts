import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getClinicianAvailability,
  saveClinicianAvailability,
} from "@/lib/services/appointment.service";

// GET /api/appointments/availability?clinician_id=...
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicianId = searchParams.get("clinician_id") || user.id;

    const availability = await getClinicianAvailability(clinicianId);

    return NextResponse.json(
      { success: true, data: availability },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch availability" },
      { status: 400 },
    );
  }
}

// PUT /api/appointments/availability
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Only clinicians and admins can update availability." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { schedule, clinician_id } = body;

    if (!Array.isArray(schedule)) {
      return NextResponse.json(
        { error: "Invalid schedule format. Expected an array of days." },
        { status: 400 },
      );
    }

    const targetClinicianId = clinician_id || user.id;
    const result = await saveClinicianAvailability(targetClinicianId, schedule);

    return NextResponse.json(
      { success: true, message: "Availability updated successfully", data: result },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update availability" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  return PUT(request);
}

