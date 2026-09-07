import { createAdminClient } from "@/lib/supabase/admin";

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
    console.warn(
      "Missing PAYSTACK_SECRET_KEY, using a mock response for development",
    );
    // Mock response for development if no key is provided
    return {
      authorization_url: "https://checkout.paystack.com/mock-url",
      access_code: "mock-access-code",
      reference: options.reference || `mock-ref-${Date.now()}`,
    };
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

  return data.data; // { authorization_url, access_code, reference }
}

export async function verifyPaystackTransaction(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  let isSuccessful = false;

  if (!secretKey) {
    console.warn(
      "Missing PAYSTACK_SECRET_KEY, automatically marking mock payment as successful.",
    );
    // Wait for 1 second to simulate network delay
    await new Promise((res) => setTimeout(res, 1000));
    isSuccessful = true;
  } else {
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
  }

  if (isSuccessful) {
    // Payment verified successfully. Let's update the payment and patient tables.
    const adminClient = createAdminClient();

    // 1. Update the payments table
    const { data: paymentRecord, error: updatePaymentError } = await adminClient
      .from("payments")
      .update({
        status: "success",
        paid_at: new Date().toISOString(),
      })
      .eq("paystack_reference", reference)
      .select("patient_id, purpose")
      .single();

    if (updatePaymentError) {
      throw new Error(
        `Failed to update payment record: ${updatePaymentError.message}`,
      );
    }

    // 2. If it's a registration payment, update the patient status to 'active'
    if (paymentRecord && paymentRecord.purpose === "registration") {
      const { error: updatePatientError } = await adminClient
        .from("patients")
        .update({ status: "active" })
        .eq("id", paymentRecord.patient_id);

      if (updatePatientError) {
        throw new Error(
          `Failed to activate patient: ${updatePatientError.message}`,
        );
      }
    }
  } else {
    throw new Error("Payment verification failed or is not successful yet.");
  }

  return true;
}
