import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/upload/medical-document
 *
 * Admin-only endpoint. Uploads a PDF to the PRIVATE `medical-documents` bucket.
 * Only admins may upload here — enforced both in this route and by the bucket
 * RLS INSERT policy (medical_documents_bucket_insert_admin_only).
 *
 * Accepts multipart/form-data with:
 *   file  (required) — must be application/pdf, max 10 MB
 *
 * Path structure (from dtc_full_setup.sql RLS):
 *   medical-documents/{patientId}/{timestamp}.pdf
 *
 * The `patientId` is the first segment so the SELECT policy allows the patient
 * to read their own documents (auth.uid()::text = foldername[1]).
 * The INSERT policy checks is_admin() so the path prefix here is {patientId},
 * not {adminId} — the admin is uploading ON BEHALF of the patient.
 *
 * Request fields:
 *   file       (required) — the PDF file
 *   patient_id (required) — UUID of the patient this document belongs to
 *
 * Returns: { data: { path } }
 *   path → store in medical_documents.pdf_storage_path
 *
 * To display the document later, use getSignedUrl("medical-documents", doc.pdf_storage_path)
 * from @/lib/utils/storage.
 */
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
    const patientId = formData.get("patient_id") as string | null;

    if (!file) {
      return NextResponse.json(
        {
          error:
            "No file provided. Send a multipart/form-data request with a 'file' field.",
        },
        { status: 400 },
      );
    }

    if (!patientId) {
      return NextResponse.json(
        { error: "patient_id is required." },
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
    const storagePath = `${patientId}/${Date.now()}.pdf`;

    // ── Upload using admin client (bypasses user-scoped RLS for storage) ──────
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

    return NextResponse.json({ data: { path: storagePath } }, { status: 201 });
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
