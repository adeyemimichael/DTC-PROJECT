import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // Your helper

// GET /api/products
export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// POST /api/products
export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { name, price } = body;

    const { data, error } = await supabase
      .from("products")
      .insert([{ name, price }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
