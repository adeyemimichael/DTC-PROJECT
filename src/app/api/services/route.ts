import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/services - list all services (RLS handles filtering active vs all depending on user)
export async function GET() {
  const supabase = await createClient();

  try {
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (servicesError) {
      return NextResponse.json({ error: servicesError.message }, { status: 500 });
    }

    return NextResponse.json({ data: services }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// POST /api/services - Create a new service (Admin only, enforced by RLS but we also check for better UX)
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
    const { name, description, duration_minutes, price, currency, is_active } =
      body;

    const { data: service, error: serviceError } = await supabase
      .from("services")
      .insert([
        {
          name,
          description,
          duration_minutes,
          price,
          currency: currency || "NGN",
          is_active: is_active !== undefined ? is_active : true,
        },
      ])
      .select()
      .single();

    if (serviceError) {
      return NextResponse.json({ error: serviceError.message }, { status: 500 });
    }

    return NextResponse.json({ data: service }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
