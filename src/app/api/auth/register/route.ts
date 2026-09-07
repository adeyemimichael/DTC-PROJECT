import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // Your helper

// POST /api/auth/register
export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { email, password, full_name, phone } = body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || "",
          phone: phone || "",
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
