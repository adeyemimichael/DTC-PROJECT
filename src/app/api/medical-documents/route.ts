import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  try {
    const supabase = await createClient();

    // ── Auth + Admin check ────────────────────────────────────────────────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Only admins can upload medical documents." },
        { status: 403 },
      );
    }

    // ── Parse the multipart form ──────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const patient_id = formData.get("patient_id") as string | null;
    const category =
      (formData.get("category") as string | null) ?? "prescription";
    const title = formData.get("title") as string | null;
    const detailsString = formData.get("details") as string | null;
    const status = (formData.get("status") as string | null) ?? "active";

    let details = {};
    if (detailsString) {
      try {
        details = JSON.parse(detailsString);
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid JSON format for 'details'." },
          { status: 400 },
        );
      }
    }

    if (!file) {
      return NextResponse.json(
        {
          error:
            "No file provided. Send a multipart/form-data request with a 'file' field.",
        },
        { status: 400 },
      );
    }

    if (!patient_id) {
      return NextResponse.json(
        { error: "patient_id is required." },
        { status: 400 },
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "title is required." },
        { status: 400 },
      );
    }

    // ── Validate mime type (medical-documents bucket: pdf only) ──────────────
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Only PDF is accepted.` },
        { status: 400 },
      );
    }

    // ── Validate file size (bucket limit: 10 MB) ──────────────────────────────
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: "PDF must be smaller than 10 MB." },
        { status: 400 },
      );
    }

    // ── Build the storage path ────────────────────────────────────────────────
    // First segment is patientId so the patient SELECT RLS policy passes.
    // The admin INSERT policy uses is_admin(), not path-based.
    const storagePath = `${patient_id}/${Date.now()}.pdf`;

    // ── 1. Upload file using admin client (bypasses user RLS for storage) ─────
    const adminClient = createAdminClient();
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await adminClient.storage
      .from("medical-documents")
      .upload(storagePath, arrayBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // ── 2. Insert DB record ───────────────────────────────────────────────────
    const { data: document, error: documentError } = await supabase
      .from("medical_documents")
      .insert([
        {
          patient_id,
          clinician_id: user.id, // Admin creating the document
          category,
          title,
          details,
          pdf_storage_path: storagePath,
          status,
        },
      ])
      .select()
      .single();

    if (documentError) {
      throw new Error(`Database insert failed: ${documentError.message}`);
    }

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (err: any) {
    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden. Only admins can upload medical documents."
          ? 403
          : 500;
    return NextResponse.json(
      { error: err.message || "Medical document upload failed" },
      { status },
    );
  }
}
