import { NextResponse } from "next/server";
import {
  getAvailableSlotsForDate,
  getAvailableSlotsForRange,
} from "@/lib/services/appointment.service";

// GET /api/appointments/available-slots
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const serviceId = searchParams.get("service_id") || undefined;
    const clinicianId = searchParams.get("clinician_id") || undefined;
    const daysParam = searchParams.get("days");
    const startDate = searchParams.get("start_date") || undefined;

    // Single day lookup
    if (date) {
      const data = await getAvailableSlotsForDate({
        date,
        serviceId,
        clinicianId,
      });
      return NextResponse.json({ success: true, data }, { status: 200 });
    }

    // Range lookup (e.g. next 7 or 14 days)
    const days = daysParam ? parseInt(daysParam, 10) : 7;
    const rangeData = await getAvailableSlotsForRange({
      startDate,
      days,
      serviceId,
      clinicianId,
    });

    return NextResponse.json({ success: true, data: rangeData }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch available slots" },
      { status: 400 },
    );
  }
}

