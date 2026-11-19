import { createAdminClient } from "@/lib/supabase/admin";
import {
  notifyPaymentSuccess,
  notifyWelcome,
  notifyAppointmentBooked,
} from "@/lib/services/notification.service";

export interface PaystackInitializeOptions {
  email: string;
  amount: number; // in lowest denomination (e.g., kobo or cents)
  currency?: string; // e.g. 'NGN' or 'USD'
  reference?: string;
  callback_url?: string;
  metadata?: any;
}

export async function initializePaystackTransaction(
  options: PaystackInitializeOptions,
) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Missing PAYSTACK_SECRET_KEY. Please set it in your environment variables.",
    );
  }

  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    },
  );

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(
      `Paystack error: ${data.message || "Failed to initialize transaction"}`,
    );
  }

  return data.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  let isSuccessful = false;

  if (!secretKey) {
    throw new Error(
      "Missing PAYSTACK_SECRET_KEY, automatically marking mock payment as successful.",
    );
  }
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    },
  );

  const data = await response.json();
  if (response.ok && data.status && data.data.status === "success") {
    isSuccessful = true;
  }

  let paymentRecord: any = null;

  if (isSuccessful) {
    const adminClient = createAdminClient();

    // 1. Update the payments table
    const { data: updatedPayment, error: updatePaymentError } = await adminClient
      .from("payments")
      .update({
        status: "success",
        paid_at: new Date().toISOString(),
      })
      .eq("paystack_reference", reference)
      .select("id, patient_id, purpose, related_appointment_id, amount, currency")
      .single();

    paymentRecord = updatedPayment;

    if (updatePaymentError) {
      throw new Error(
        `Failed to update payment record: ${updatePaymentError.message}`,
      );
    }

    // 2. Handle specific payment purposes and in-app notifications
    if (paymentRecord) {
      if (paymentRecord.purpose === "registration") {
        // Activate the patient profile
        const { error: updatePatientError } = await adminClient
          .from("patients")
          .update({ status: "active" })
          .eq("id", paymentRecord.patient_id);

        if (updatePatientError) {
          throw new Error(
            `Failed to activate patient: ${updatePatientError.message}`,
          );
        }

        // Fetch patient name for personalized welcome notification
        const { data: patientProfile } = await adminClient
          .from("patients")
          .select("full_name")
          .eq("id", paymentRecord.patient_id)
          .single();

        // Send payment confirmation + welcome notification
        await notifyPaymentSuccess({
          userId: paymentRecord.patient_id,
          amount: paymentRecord.amount,
          currency: paymentRecord.currency,
          purpose: "registration",
          paymentId: paymentRecord.id,
        });

        await notifyWelcome({
          userId: paymentRecord.patient_id,
          patientName: patientProfile?.full_name,
        });
      } else if (
        paymentRecord.purpose === "appointment" ||
        paymentRecord.purpose === "follow_up"
      ) {
        // Mark the appointment as pending approval now that it's paid
        if (paymentRecord.related_appointment_id) {
          const { error: updateAppointmentError } = await adminClient
            .from("appointments")
            .update({ status: "pending_approval" })
            .eq("id", paymentRecord.related_appointment_id);

          if (updateAppointmentError) {
            throw new Error(
              `Failed to update appointment status: ${updateAppointmentError.message}`,
            );
          }

          // Fetch appointment details (clinician, schedule, patient name)
          const { data: aptData } = await adminClient
            .from("appointments")
            .select("id, scheduled_at, clinician_id, patient:patients(full_name)")
            .eq("id", paymentRecord.related_appointment_id)
            .single();

          // Send payment confirmation notification
          await notifyPaymentSuccess({
            userId: paymentRecord.patient_id,
            amount: paymentRecord.amount,
            currency: paymentRecord.currency,
            purpose: paymentRecord.purpose,
            paymentId: paymentRecord.id,
          });

          // Send appointment booked notification (to patient and assigned doctor)
          await notifyAppointmentBooked({
            patientId: paymentRecord.patient_id,
            clinicianId: aptData?.clinician_id,
            appointmentId: paymentRecord.related_appointment_id,
            scheduledAt: aptData?.scheduled_at,
            patientName: (aptData?.patient as any)?.full_name,
          });
        }
      }
    }
  } else {
    throw new Error("Payment verification failed or is not successful yet.");
  }

  return { success: true, payment: paymentRecord };
}
