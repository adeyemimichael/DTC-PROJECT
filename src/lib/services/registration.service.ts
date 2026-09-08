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

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: fullName,
        phone: data.phoneNumber,
        role: "patient",
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

  await supabaseAdmin
    .from("profiles")
    .update({ phone: data.phoneNumber })
    .eq("id", userId);

  // 2. Insert into patients table.
  // We use the admin client because the user might not have a confirmed email yet (if email_confirm is on),
  // which means they won't pass RLS `patients_insert_own` via standard client.
  const fullAddress = data.city
    ? `${data.address}, ${data.city}`
    : data.address;

  const { error: patientError } = await supabaseAdmin.from("patients").insert({
    id: userId,
    date_of_birth: data.dob,
    gender: data.gender.toLowerCase(),
    address: fullAddress,
    status: "pending_payment", // Default from DB schema
  });

  if (patientError) {
    // Ideally we would roll back auth user creation here, but we can also just log it
    // or let the user retry. For now, we throw.
    throw new Error(
      `Failed to create patient profile: ${patientError.message}`,
    );
  }

  // 3. Initialize Paystack transaction
  const reference = `REG-${userId}-${Date.now()}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  const paystackResult = await initializePaystackTransaction({
    email: data.email,
    amount: 4900,
    currency: "USD",
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
      amount: 49.0,
      currency: "USD",
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
