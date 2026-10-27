import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializePaystackTransaction } from "./paystack.service";

export interface TimeSlotDto {
  start: string; // "08:00" or "8:00 AM"
  end: string; // "12:00" or "12:00 PM"
}

export interface DayAvailabilityDto {
  day: string; // "Monday", "Tuesday", etc.
  day_of_week?: number; // 0 (Sunday) to 6 (Saturday)
  active: boolean;
  slots: TimeSlotDto[];
}

export interface AvailableSlot {
  time: string; // "09:00"
  label: string; // "9:00 AM"
  start_iso: string; // "2026-11-04T09:00:00.000Z"
  available: boolean;
}

export interface BookAppointmentDto {
  patientId: string;
  userEmail: string;
  serviceId: string;
  scheduledAt: string; // ISO string
  reason?: string;
  patientUploadId?: string;
  clinicianId?: string;
  isAdmin?: boolean;
  callbackUrl?: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Helper: parse "8:00 AM", "08:00", "08:00:00", "2:00 PM", "14:00", "14:00:00"
export function parseTimeString(t: string): { hour: number; minute: number } {
  if (!t) return { hour: 0, minute: 0 };
  const clean = t.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!match) return { hour: 0, minute: 0 };

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  return { hour, minute };
}

export function to24HourString(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

export function to12HourString(hour: number, minute: number): string {
  const meridiem = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

/**
 * Get default clinician ID (prefer one who has availability records configured)
 */
export async function getDefaultClinicianId(): Promise<string | null> {
  const adminClient = createAdminClient();

  // 1. Prefer clinician who already has availability records in the database
  const { data: avail } = await adminClient
    .from("clinician_availability")
    .select("clinician_id")
    .limit(1)
    .maybeSingle();

  if (avail?.clinician_id) {
    return avail.clinician_id;
  }

  // 2. Fallback to first admin profile
  const { data } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();

  return data?.id || null;
}

/**
 * Fetch clinician's weekly availability schedule
 */
export async function getClinicianAvailability(
  clinicianId?: string,
): Promise<DayAvailabilityDto[]> {
  const adminClient = createAdminClient();
  let targetClinicianId = clinicianId;

  if (!targetClinicianId) {
    targetClinicianId = (await getDefaultClinicianId()) || undefined;
  }

  if (!targetClinicianId) {
    return DAY_NAMES.map((day, idx) => ({
      day,
      day_of_week: idx,
      active: false,
      slots: [],
    }));
  }

  const { data: rows, error } = await adminClient
    .from("clinician_availability")
    .select("*")
    .eq("clinician_id", targetClinicianId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching clinician availability:", error);
    throw new Error(`Failed to fetch availability: ${error.message}`);
  }

  // Build the 7-day structure Monday - Sunday (or Sunday - Saturday)
  const result: DayAvailabilityDto[] = DAY_NAMES.map((dayName, dayIndex) => {
    const dayRows = (rows || []).filter((r) => r.day_of_week === dayIndex);
    const active = dayRows.length > 0 && dayRows.some((r) => r.is_active);

    const slots: TimeSlotDto[] = dayRows
      .filter((r) => r.is_active)
      .map((r) => {
        const { hour: sH, minute: sM } = parseTimeString(r.start_time);
        const { hour: eH, minute: eM } = parseTimeString(r.end_time);
        return {
          start: to12HourString(sH, sM),
          end: to12HourString(eH, eM),
        };
      });

    return {
      day: dayName,
      day_of_week: dayIndex,
      active,
      slots,
    };
  });

  return result;
}

/**
 * Save clinician's weekly availability schedule (Replaces previous entries)
 */
export async function saveClinicianAvailability(
  clinicianId: string,
  weeklySchedule: DayAvailabilityDto[],
) {
  const adminClient = createAdminClient();

  // 1. Delete existing availability for this clinician
  const { error: deleteError } = await adminClient
    .from("clinician_availability")
    .delete()
    .eq("clinician_id", clinicianId);

  if (deleteError) {
    throw new Error(
      `Failed to clear previous schedule: ${deleteError.message}`,
    );
  }

  // 2. Prepare new rows to insert
  const rowsToInsert: any[] = [];

  for (const dayItem of weeklySchedule) {
    // Resolve day index (e.g. from day name if day_of_week not provided)
    let dayIndex = dayItem.day_of_week;
    if (dayIndex === undefined) {
      dayIndex = DAY_NAMES.findIndex(
        (d) => d.toLowerCase() === dayItem.day.toLowerCase(),
      );
    }
    if (dayIndex === -1 || !dayItem.active || !dayItem.slots?.length) {
      continue;
    }

    for (const slot of dayItem.slots) {
      const { hour: sH, minute: sM } = parseTimeString(slot.start);
      const { hour: eH, minute: eM } = parseTimeString(slot.end);

      const startTime = to24HourString(sH, sM);
      const endTime = to24HourString(eH, eM);

      rowsToInsert.push({
        clinician_id: clinicianId,
        day_of_week: dayIndex,
        start_time: startTime,
        end_time: endTime,
        is_active: true,
      });
    }
  }

  if (rowsToInsert.length > 0) {
    const { error: insertError } = await adminClient
      .from("clinician_availability")
      .insert(rowsToInsert);

    if (insertError) {
      throw new Error(`Failed to save schedule: ${insertError.message}`);
    }
  }

  return { success: true, count: rowsToInsert.length };
}

/**
 * Calculate available booking slots for a specific date (YYYY-MM-DD)
 */
export async function getAvailableSlotsForDate(options: {
  date: string; // YYYY-MM-DD
  serviceId?: string;
  clinicianId?: string;
}): Promise<{
  date: string;
  day: string;
  service_duration: number;
  slots: AvailableSlot[];
}> {
  const adminClient = createAdminClient();
  const { date: dateStr } = options;

  let targetClinicianId = options.clinicianId;
  if (!targetClinicianId) {
    targetClinicianId = (await getDefaultClinicianId()) || undefined;
  }

  // 1. Determine service duration
  let durationMinutes = 60; // default 1 hour
  if (options.serviceId) {
    const { data: service } = await adminClient
      .from("services")
      .select("duration_minutes")
      .eq("id", options.serviceId)
      .single();
    if (service?.duration_minutes) {
      durationMinutes = service.duration_minutes;
    }
  }

  // 2. Parse date components and find day of week
  const parts = dateStr.split("-").map(Number);
  if (
    parts.length !== 3 ||
    isNaN(parts[0]) ||
    isNaN(parts[1]) ||
    isNaN(parts[2])
  ) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD");
  }
  const [year, month, day] = parts;
  const targetDateObj = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = targetDateObj.getUTCDay();
  const dayName = DAY_NAMES[dayOfWeek];

  if (!targetClinicianId) {
    return {
      date: dateStr,
      day: dayName,
      service_duration: durationMinutes,
      slots: [],
    };
  }

  // 3. Fetch doctor's working blocks for this day of week
  const { data: workingBlocks, error: availError } = await adminClient
    .from("clinician_availability")
    .select("start_time, end_time")
    .eq("clinician_id", targetClinicianId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true)
    .order("start_time", { ascending: true });

  if (availError || !workingBlocks || workingBlocks.length === 0) {
    return {
      date: dateStr,
      day: dayName,
      service_duration: durationMinutes,
      slots: [],
    };
  }

  // 4. Fetch booked/pending appointments on this specific date
  const dayStartIso = `${dateStr}T00:00:00.000Z`;
  const dayEndIso = `${dateStr}T23:59:59.999Z`;

  const { data: appointments, error: aptError } = await adminClient
    .from("appointments")
    .select("id, scheduled_at, status, created_at")
    .eq("clinician_id", targetClinicianId)
    .gte("scheduled_at", dayStartIso)
    .lte("scheduled_at", dayEndIso)
    .not("status", "in", '("cancelled","declined")');

  if (aptError) {
    console.error("Error querying appointments for conflict:", aptError);
  }

  // Filter out expired pending_payment (> 15 minutes old)
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  const activeBookings = (appointments || []).filter((apt) => {
    if (apt.status === "pending_payment") {
      const createdAtTime = new Date(apt.created_at).getTime();
      return createdAtTime >= fifteenMinutesAgo; // keep only unexpired holds
    }
    return true; // confirmed, pending_approval, completed
  });

  const bookedTimes = new Set(
    activeBookings.map((b) => {
      const d = new Date(b.scheduled_at);
      const h = String(d.getUTCHours()).padStart(2, "0");
      const m = String(d.getUTCMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    }),
  );

  // 5. Generate discrete slots for each working block
  const generatedSlots: AvailableSlot[] = [];
  const now = new Date();

  for (const block of workingBlocks) {
    const { hour: startHour, minute: startMin } = parseTimeString(
      block.start_time,
    );
    const { hour: endHour, minute: endMin } = parseTimeString(block.end_time);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + durationMinutes <= endMinutes) {
      const slotHour = Math.floor(currentMinutes / 60);
      const slotMinute = currentMinutes % 60;

      const timeString = `${String(slotHour).padStart(2, "0")}:${String(slotMinute).padStart(2, "0")}`;
      const label = to12HourString(slotHour, slotMinute);
      const slotIso = new Date(
        Date.UTC(year, month - 1, day, slotHour, slotMinute, 0, 0),
      ).toISOString();

      // Check if slot has already passed today
      const slotDateObj = new Date(slotIso);
      const isPastTime = slotDateObj.getTime() <= now.getTime();

      // Check if already booked
      const isBooked = bookedTimes.has(timeString);

      if (!isPastTime && !isBooked) {
        generatedSlots.push({
          time: timeString,
          label,
          start_iso: slotIso,
          available: true,
        });
      }

      currentMinutes += durationMinutes;
    }
  }

  return {
    date: dateStr,
    day: dayName,
    service_duration: durationMinutes,
    slots: generatedSlots,
  };
}

/**
 * Fetch available slots across a range of days (e.g. next 7 or 14 days)
 */
export async function getAvailableSlotsForRange(options: {
  startDate?: string; // YYYY-MM-DD (defaults to today)
  days?: number; // default 7
  serviceId?: string;
  clinicianId?: string;
}) {
  const daysCount = Math.min(Math.max(options.days || 7, 1), 30);
  const now = new Date();

  let startYear = now.getFullYear();
  let startMonth = now.getMonth();
  let startDay = now.getDate();

  if (options.startDate) {
    const [y, m, d] = options.startDate.split("-").map(Number);
    startYear = y;
    startMonth = m - 1;
    startDay = d;
  }

  const results = [];

  for (let i = 0; i < daysCount; i++) {
    const current = new Date(Date.UTC(startYear, startMonth, startDay + i));
    const y = current.getUTCFullYear();
    const m = String(current.getUTCMonth() + 1).padStart(2, "0");
    const d = String(current.getUTCDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    const daySlots = await getAvailableSlotsForDate({
      date: dateStr,
      serviceId: options.serviceId,
      clinicianId: options.clinicianId,
    });

    results.push({
      date: dateStr,
      day: daySlots.day,
      available_count: daySlots.slots.length,
      slots: daySlots.slots,
    });
  }

  return results;
}

/**
 * Book an appointment with Paystack payment initialization
 */
export async function bookAppointment(data: BookAppointmentDto) {
  const adminClient = createAdminClient();

  let targetClinicianId = data.clinicianId;
  if (!targetClinicianId) {
    targetClinicianId = (await getDefaultClinicianId()) || undefined;
  }

  if (!targetClinicianId) {
    throw new Error("No clinician is currently configured for appointments.");
  }

  // 1. Verify service details & pricing
  const { data: service, error: serviceError } = await adminClient
    .from("services")
    .select("*")
    .eq("id", data.serviceId)
    .single();

  if (serviceError || !service) {
    throw new Error("Invalid service selected.");
  }

  if (!service.is_active) {
    throw new Error("The selected service is currently not active.");
  }

  // 2. Conflict check at exact scheduled_at timestamp
  const scheduledTime = new Date(data.scheduledAt);
  if (isNaN(scheduledTime.getTime())) {
    throw new Error("Invalid appointment schedule date.");
  }

  if (scheduledTime.getTime() <= Date.now()) {
    throw new Error("Cannot book an appointment in the past.");
  }

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { data: existingApt } = await adminClient
    .from("appointments")
    .select("id, status, created_at")
    .eq("clinician_id", targetClinicianId)
    .eq("scheduled_at", data.scheduledAt)
    .not("status", "in", '("cancelled","declined")')
    .limit(1)
    .maybeSingle();

  if (existingApt) {
    // If pending payment and created within 15 min, it's held. Otherwise it has expired.
    const isHoldValid =
      existingApt.status !== "pending_payment" ||
      new Date(existingApt.created_at).getTime() >=
        new Date(fifteenMinutesAgo).getTime();

    if (isHoldValid) {
      throw new Error(
        "This time slot is no longer available. Please select another time.",
      );
    }
  }

  // 3. Insert the appointment record
  const initialStatus = data.isAdmin ? "confirmed" : "pending_payment";

  const { data: appointment, error: aptInsertError } = await adminClient
    .from("appointments")
    .insert({
      patient_id: data.patientId,
      clinician_id: targetClinicianId,
      service_id: data.serviceId,
      scheduled_at: data.scheduledAt,
      reason: data.reason || null,
      patient_upload_id: data.patientUploadId || null,
      booked_by: data.isAdmin ? "admin" : "patient",
      status: initialStatus,
    })
    .select("*, services(*), profiles:clinician_id(full_name)")
    .single();

  if (aptInsertError || !appointment) {
    throw new Error(
      aptInsertError?.message || "Failed to create appointment record.",
    );
  }

  // 4. If admin booked, no payment needed right away
  if (data.isAdmin) {
    return {
      appointment,
      paymentUrl: null,
      reference: null,
    };
  }

  // 5. Initialize Paystack payment for patient
  const priceAmount = Number(service.price);
  const amountInKobo = Math.round(priceAmount * 100);
  const reference = `APP-${appointment.id}-${Date.now()}`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const callbackUrl =
    data.callbackUrl || `${baseUrl}/user/confirm?purpose=appointment`;

  const paystackResult = await initializePaystackTransaction({
    email: data.userEmail,
    amount: amountInKobo,
    currency: service.currency || "NGN",
    reference,
    callback_url: callbackUrl,
    metadata: {
      userId: data.patientId,
      appointmentId: appointment.id,
      serviceId: service.id,
      purpose: "appointment",
    },
  });

  // 6. Record transaction in payments table
  const { error: paymentError } = await adminClient.from("payments").insert({
    patient_id: data.patientId,
    purpose: "appointment",
    related_appointment_id: appointment.id,
    amount: priceAmount,
    currency: service.currency || "NGN",
    paystack_reference: paystackResult.reference,
    paystack_access_code: paystackResult.access_code,
    status: "pending",
  });

  if (paymentError) {
    console.error(
      "Failed to insert payment record for appointment:",
      paymentError,
    );
  }

  return {
    appointment,
    paymentUrl: paystackResult.authorization_url,
    reference: paystackResult.reference,
    accessCode: paystackResult.access_code,
  };
}
