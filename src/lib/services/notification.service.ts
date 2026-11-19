import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationType =
  | "welcome"
  | "payment_success"
  | "appointment_booked"
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "appointment_declined"
  | "new_document"
  | "new_upload";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  relatedTable?: string;
  relatedId?: string;
}

/**
 * Inserts a single notification using the admin client (bypasses RLS).
 * Safely catches errors so notification failures never crash primary business flows.
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("notifications")
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        message: input.message || null,
        related_table: input.relatedTable || null,
        related_id: input.relatedId || null,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("[NotificationService] Failed to create notification:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[NotificationService] Unexpected error creating notification:", err);
    return { success: false, error: err?.message || "Internal server error" };
  }
}

/**
 * Inserts multiple notifications in a single batch.
 */
export async function createNotifications(inputs: CreateNotificationInput[]) {
  if (!inputs.length) return { success: true, data: [] };

  try {
    const admin = createAdminClient();
    const rows = inputs.map((input) => ({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message || null,
      related_table: input.relatedTable || null,
      related_id: input.relatedId || null,
      is_read: false,
    }));

    const { data, error } = await admin
      .from("notifications")
      .insert(rows)
      .select();

    if (error) {
      console.error("[NotificationService] Failed to batch create notifications:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[NotificationService] Unexpected batch error:", err);
    return { success: false, error: err?.message || "Internal server error" };
  }
}

// ---------------------------------------------------------------------------
// Contextual Notification Helpers
// ---------------------------------------------------------------------------

/**
 * Patient: Payment successful notification
 */
export async function notifyPaymentSuccess(params: {
  userId: string;
  amount: number;
  currency?: string;
  purpose: "registration" | "appointment" | "follow_up" | string;
  paymentId?: string;
}) {
  const formattedAmount = (params.amount / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const curr = params.currency || "NGN";

  let title = "Payment Successful";
  let message = `Your payment of ${curr} ${formattedAmount} was received successfully.`;

  if (params.purpose === "registration") {
    title = "Registration Fee Confirmed";
    message = `Your registration payment of ${curr} ${formattedAmount} has been confirmed. Welcome to DTC Telemedicine!`;
  } else if (params.purpose === "appointment" || params.purpose === "follow_up") {
    title = "Consultation Payment Confirmed";
    message = `Your consultation fee of ${curr} ${formattedAmount} has been processed.`;
  }

  return createNotification({
    userId: params.userId,
    type: "payment_success",
    title,
    message,
    relatedTable: "payments",
    relatedId: params.paymentId,
  });
}

/**
 * Patient: Welcome & account activation notification
 */
export async function notifyWelcome(params: {
  userId: string;
  patientName?: string;
}) {
  const greeting = params.patientName ? `Welcome, ${params.patientName}!` : "Welcome to DTC Telemedicine!";
  return createNotification({
    userId: params.userId,
    type: "welcome",
    title: greeting,
    message: "Your profile is fully activated. You can now explore available clinicians and book consultations anytime.",
    relatedTable: "patients",
    relatedId: params.userId,
  });
}

/**
 * Patient & Doctor: Consultation booked and pending approval
 */
export async function notifyAppointmentBooked(params: {
  patientId: string;
  clinicianId?: string | null;
  appointmentId: string;
  scheduledAt?: string;
  patientName?: string;
}) {
  const dateStr = params.scheduledAt
    ? new Date(params.scheduledAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "the scheduled time";

  const notificationsToCreate: CreateNotificationInput[] = [
    {
      userId: params.patientId,
      type: "appointment_booked",
      title: "Appointment Request Submitted",
      message: `Your consultation request for ${dateStr} has been submitted and is awaiting doctor confirmation.`,
      relatedTable: "appointments",
      relatedId: params.appointmentId,
    },
  ];

  // If a clinician is assigned, notify them as well
  if (params.clinicianId) {
    const patientLabel = params.patientName ? ` from ${params.patientName}` : "";
    notificationsToCreate.push({
      userId: params.clinicianId,
      type: "appointment_booked",
      title: "New Appointment Request",
      message: `New consultation booked${patientLabel} for ${dateStr}. Please review and approve.`,
      relatedTable: "appointments",
      relatedId: params.appointmentId,
    });
  }

  return createNotifications(notificationsToCreate);
}

/**
 * Patient: Appointment confirmed / approved by doctor
 */
export async function notifyAppointmentConfirmed(params: {
  patientId: string;
  appointmentId: string;
  scheduledAt?: string;
  meetingLink?: string;
  doctorName?: string;
}) {
  const dateStr = params.scheduledAt
    ? new Date(params.scheduledAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "your scheduled time";

  const doctorLabel = params.doctorName ? `by Dr. ${params.doctorName}` : "by your clinician";
  let message = `Your appointment for ${dateStr} has been confirmed ${doctorLabel}.`;
  if (params.meetingLink) {
    message += " Meeting link is ready in your appointment details.";
  }

  return createNotification({
    userId: params.patientId,
    type: "appointment_confirmed",
    title: "Appointment Confirmed",
    message,
    relatedTable: "appointments",
    relatedId: params.appointmentId,
  });
}

/**
 * Patient or Doctor: Appointment cancelled
 */
export async function notifyAppointmentCancelled(params: {
  userId: string;
  appointmentId: string;
  scheduledAt?: string;
  reason?: string;
  cancelledBy?: string;
}) {
  const dateStr = params.scheduledAt
    ? new Date(params.scheduledAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "your scheduled consultation";

  let message = `The consultation scheduled for ${dateStr} has been cancelled.`;
  if (params.reason) {
    message += ` Reason: "${params.reason}"`;
  }

  return createNotification({
    userId: params.userId,
    type: "appointment_cancelled",
    title: "Appointment Cancelled",
    message,
    relatedTable: "appointments",
    relatedId: params.appointmentId,
  });
}

/**
 * Patient: Appointment declined
 */
export async function notifyAppointmentDeclined(params: {
  patientId: string;
  appointmentId: string;
  scheduledAt?: string;
  reason?: string;
}) {
  const dateStr = params.scheduledAt
    ? new Date(params.scheduledAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "your requested time";

  let message = `Your appointment request for ${dateStr} could not be accepted.`;
  if (params.reason) {
    message += ` Reason: "${params.reason}"`;
  }

  return createNotification({
    userId: params.patientId,
    type: "appointment_declined",
    title: "Appointment Request Declined",
    message,
    relatedTable: "appointments",
    relatedId: params.appointmentId,
  });
}

/**
 * Patient: Doctor uploaded a new medical document/note
 */
export async function notifyNewDocument(params: {
  patientId: string;
  documentId: string;
  category?: string;
  doctorName?: string;
}) {
  const categoryLabel = params.category
    ? params.category.replace(/_/g, " ")
    : "medical document";
  const doctorLabel = params.doctorName ? ` by Dr. ${params.doctorName}` : "";

  return createNotification({
    userId: params.patientId,
    type: "new_document",
    title: "New Medical Record Available",
    message: `A new ${categoryLabel} has been uploaded to your file${doctorLabel}.`,
    relatedTable: "medical_documents",
    relatedId: params.documentId,
  });
}

/**
 * Doctor: Patient uploaded documents for their upcoming appointment
 */
export async function notifyNewUpload(params: {
  clinicianId: string;
  appointmentId: string;
  patientName?: string;
}) {
  const patientLabel = params.patientName ? ` from ${params.patientName}` : "";

  return createNotification({
    userId: params.clinicianId,
    type: "new_upload",
    title: "Patient Documents Uploaded",
    message: `New pre-consultation documents uploaded${patientLabel}. Ready for your review.`,
    relatedTable: "appointments",
    relatedId: params.appointmentId,
  });
}
