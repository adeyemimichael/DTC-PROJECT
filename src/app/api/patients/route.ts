import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", user.id)
      .single();

    if (patientError) {
      return NextResponse.json({ error: patientError.message }, { status: 500 });
    }

    return NextResponse.json({ data: patient }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      date_of_birth,
      gender,
      address,
      next_of_kin_name,
      next_of_kin_phone,
      passport_url,
    } = body;

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .insert([
        {
          id: user.id, // Explicitly tying the patient record to the logged-in user
          date_of_birth,
          gender,
          address,
          next_of_kin_name,
          next_of_kin_phone,
          passport_url,
        },
      ])
      .select()
      .single();

    if (patientError) {
      return NextResponse.json({ error: patientError.message }, { status: 500 });
    }

    return NextResponse.json({ data: patient }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      date_of_birth,
      gender,
      address,
      next_of_kin_name,
      next_of_kin_phone,
      passport_url,
    } = body;

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .update({
        date_of_birth,
        gender,
        address,
        next_of_kin_name,
        next_of_kin_phone,
        passport_url,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (patientError) {
      return NextResponse.json({ error: patientError.message }, { status: 500 });
    }

    return NextResponse.json({ data: patient }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
