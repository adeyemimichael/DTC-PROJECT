import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patient_id") || user.id;

    // RLS handles visibility (patient sees own, admin sees all)
    const { data: uploads, error: uploadsError } = await supabase
      .from("patient_uploads")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (uploadsError) {
      return NextResponse.json({ error: uploadsError.message }, { status: 500 });
    }

    return NextResponse.json({ data: uploads }, { status: 200 });
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
    const { file_type, category, storage_path, description } = body;

    // patient_uploads_insert_own policy only allows users to insert their own records
    const { data: upload, error: uploadError } = await supabase
      .from("patient_uploads")
      .insert([
        {
          patient_id: user.id, // Enforce patient's own ID
          file_type,
          category: category || "general",
          storage_path,
          description,
        },
      ])
      .select()
      .single();

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    return NextResponse.json({ data: upload }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
