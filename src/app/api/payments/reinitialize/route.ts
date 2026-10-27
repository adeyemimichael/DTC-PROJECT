import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializePaystackTransaction } from "@/lib/services/paystack.service";

// POST /api/payments/reinitialize
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const email = user.email;

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { appointment_id } = body;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const supabaseAdmin = createAdminClient();

    // ─────────────────────────────────────────────────────────────────────────────
    // CASE 1: REINITIALIZE APPOINTMENT PAYMENT
    // ─────────────────────────────────────────────────────────────────────────────
    if (appointment_id) {
      const { data: appointment, error: aptError } = await supabaseAdmin
        .from("appointments")
        .select("id, patient_id, scheduled_at, status, services(*)")
        .eq("id", appointment_id)
        .single();

      if (aptError || !appointment) {
        return NextResponse.json(
          { error: "Appointment not found." },
          { status: 404 },
        );
      }

      if (appointment.patient_id !== userId) {
        return NextResponse.json(
          { error: "Unauthorized access to this appointment." },
          { status: 403 },
        );
      }

      const service: any = Array.isArray(appointment.services)
        ? appointment.services[0]
        : appointment.services;
      if (!service) {
        return NextResponse.json(
          { error: "Associated service not found for this appointment." },
          { status: 400 },
        );
      }

      const priceAmount = Number(service.price);
      const amountInKobo = Math.round(priceAmount * 100);
      const reference = `APP-${appointment.id}-${Date.now()}`;

      const paystackResult = await initializePaystackTransaction({
        email,
        amount: amountInKobo,
        currency: service.currency || "NGN",
        reference,
        callback_url: `${baseUrl}/user/confirm?purpose=appointment`,
        metadata: {
          userId,
          appointmentId: appointment.id,
          serviceId: service.id,
          purpose: "appointment",
        },
      });

      // Save transaction to the payments table
      const { error: paymentRecordError } = await supabaseAdmin
        .from("payments")
        .insert({
          patient_id: userId,
          purpose: "appointment",
          related_appointment_id: appointment.id,
          amount: priceAmount,
          currency: service.currency || "NGN",
          paystack_reference: paystackResult.reference,
          paystack_access_code: paystackResult.access_code,
          status: "pending",
        });

      if (paymentRecordError) {
        throw new Error(
          `Failed to record appointment payment: ${paymentRecordError.message}`,
        );
      }

      return NextResponse.json({
        success: true,
        authorization_url: paystackResult.authorization_url,
        access_code: paystackResult.access_code,
        reference: paystackResult.reference,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // CASE 2: REINITIALIZE REGISTRATION FEE PAYMENT
    // ─────────────────────────────────────────────────────────────────────────────
    const reference = `REG-${userId}-${Date.now()}`;

    const paystackResult = await initializePaystackTransaction({
      email: email,
      amount: 6900000, // ₦69,000 in kobo
      currency: "NGN",
      reference,
      callback_url: `${baseUrl}/user/confirm?purpose=registration`,
      metadata: {
        userId,
        purpose: "patient_registration_fee",
      },
    });

    const { error: paymentRecordError } = await supabaseAdmin
      .from("payments")
      .insert({
        patient_id: userId,
        purpose: "registration",
        amount: 69000.0,
        currency: "NGN",
        paystack_reference: paystackResult.reference,
        paystack_access_code: paystackResult.access_code,
        status: "pending",
      });

    if (paymentRecordError) {
      throw new Error(
        `Failed to initialize payment record: ${paymentRecordError.message}`,
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: paystackResult.authorization_url,
      access_code: paystackResult.access_code,
      reference: paystackResult.reference,
    });
  } catch (error: any) {
    console.error("Payment reinitialization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reinitialize payment" },
      { status: 400 },
    );
  }
}
