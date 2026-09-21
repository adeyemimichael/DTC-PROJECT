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

    const reference = `REG-${userId}-${Date.now()}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    const paystackResult = await initializePaystackTransaction({
      email: email,
      amount: 6900000, // ₦69,000 in kobo
      currency: "NGN",
      reference,
      callback_url: `${baseUrl}/user/confirm`,
      metadata: {
        userId,
        purpose: "patient_registration_fee",
      },
    });

    // Save transaction to the payments table using admin client
    const supabaseAdmin = createAdminClient();
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
    });
  } catch (error: any) {
    console.error("Payment reinitialization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reinitialize payment" },
      { status: 400 },
    );
  }
}
