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
    const { data: documents, error: documentsError } = await supabase
      .from("medical_documents")
      .select("*, clinician:clinician_id(full_name)")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (documentsError) {
      return NextResponse.json(
        { error: documentsError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: documents }, { status: 200 });
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

    // Only admins can insert medical documents per RLS policy: "medical_documents_insert_admin_only"
    const body = await request.json();
    const { patient_id, category, title, details, pdf_storage_path, status } =
      body;

    const { data: document, error: documentError } = await supabase
      .from("medical_documents")
      .insert([
        {
          patient_id,
          clinician_id: user.id, // Admin creating the document
          category,
          title,
          details,
          pdf_storage_path,
          status,
        },
      ])
      .select()
      .single();

    if (documentError) {
      return NextResponse.json(
        { error: documentError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
