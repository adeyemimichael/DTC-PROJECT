import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const id = (await params).id;

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
      .update({
        name,
        description,
        duration_minutes,
        price,
        currency,
        is_active,
      })
      .eq("id", id)
      .select()
      .single();

    if (serviceError) {
      return NextResponse.json({ error: serviceError.message }, { status: 500 });
    }

    return NextResponse.json({ data: service }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const id = (await params).id;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error: serviceError } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (serviceError) {
      return NextResponse.json({ error: serviceError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Service deleted successfully" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
