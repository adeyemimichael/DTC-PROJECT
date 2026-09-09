import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializePaystackTransaction } from "./paystack.service";

export interface RegisterPatientDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
}

export async function registerPatient(data: RegisterPatientDto) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const fullName = `${data.firstName} ${data.lastName}`;

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: fullName,
        role: "patient",
        phone: data.phoneNumber,
      },
    },
  });

  if (authError) {
    throw new Error(`Authentication failed: ${authError.message}`);
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error("Failed to create user account. No user ID returned.");
  }

  // 2. Insert into patients table.
  const fullAddress = data.city
    ? `${data.address}, ${data.city}`
    : data.address;

  const { error: patientError } = await supabaseAdmin.from("patients").insert({
    id: userId,
    date_of_birth: data.dob,
    gender: data.gender.toLowerCase(),
    address: fullAddress,
    status: "pending_payment",
  });

  if (patientError) {
    throw new Error(
      `Failed to create patient profile: ${patientError.message}`,
    );
  }

  // 3. Initialize Paystack transaction
  const reference = `REG-${userId}-${Date.now()}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  const paystackResult = await initializePaystackTransaction({
    email: data.email,
    amount: 6900000,
    currency: "NGN",
    reference,
    callback_url: `${baseUrl}/user/confirm`,
    metadata: {
      userId,
      purpose: "patient_registration_fee",
    },
  });

  // 4. Save transaction to the payments table using admin client
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

  return {
    user: authData.user,
    paymentUrl: paystackResult.authorization_url,
    reference: paystackResult.reference,
  };
}
