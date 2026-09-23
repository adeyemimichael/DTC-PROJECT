import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/upload/patient-upload
 *
 * Accepts multipart/form-data with the following fields:
 *   file         (required) — the file to upload
 *   description  (optional) — plain text description stored on the upload record
 *   category     (optional) — "lab_result_scan" | "general" (defaults to "general")
 *
 * Uploads to the PRIVATE `patient-uploads` bucket under:
 *   patient-uploads/{userId}/{timestamp}.{ext}
 *
 * Bucket constraints (from dtc_full_setup.sql):
 *   - Allowed types: image/jpeg, image/png, audio/mpeg, audio/mp4, audio/wav,
 *                    video/mp4, video/quicktime, application/pdf
 *   - Max size: 50 MB
 *
 * Returns: { data: { path, file_type, category, description } }
 *   path      → storage_path to insert into patient_uploads.storage_path
 *   file_type → the resolved file_type category (image | audio | video | document)
 *
 * After receiving this response, the frontend should call
 * POST /api/patient-uploads with the returned values to create the DB record.
 *
 * To display the file later, use getSignedUrl("patient-uploads", upload.storage_path)
 * from @/lib/utils/storage.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // ── Auth ─────────────────────────────────────────────────────────────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Parse the multipart form ──────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const description = formData.get("description") as string | null;
    const category = (formData.get("category") as string | null) ?? "general";

    if (!file) {
      return NextResponse.json(
        {
          error:
            "No file provided. Send a multipart/form-data request with a 'file' field.",
        },
        { status: 400 },
      );
    }

    // ── Validate category ─────────────────────────────────────────────────────
    const validCategories = ["lab_result_scan", "general"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          error: `Invalid category: "${category}". Must be "lab_result_scan" or "general".`,
        },
        { status: 400 },
      );
    }

    // ── Validate mime type and resolve file_type for the DB record ────────────
    const mimeToFileType: Record<string, string> = {
      "image/jpeg": "image",
      "image/png": "image",
      "audio/mpeg": "audio",
      "audio/mp4": "audio",
      "audio/wav": "audio",
      "video/mp4": "video",
      "video/quicktime": "video",
      "application/pdf": "document",
    };

    const file_type = mimeToFileType[file.type];
    if (!file_type) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Allowed: jpeg, png, mp3, mp4 audio, wav, mp4 video, quicktime, pdf.`,
        },
        { status: 400 },
      );
    }

    // ── Validate file size (bucket limit: 50 MB) ──────────────────────────────
    const maxBytes = 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: "File must be smaller than 50 MB." },
        { status: 400 },
      );
    }

    // ── Build the storage path ────────────────────────────────────────────────
    // MUST start with "{userId}/..." so the RLS INSERT policy passes.
    const extension = file.name.split(".").pop() ?? "bin";
    const storagePath = `${user.id}/${Date.now()}.${extension}`;

    // ── Upload ────────────────────────────────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("patient-uploads")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false, // patient-uploads are immutable — no overwriting
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    return NextResponse.json(
      {
        data: {
          path: storagePath,
          file_type,
          category,
          description: description ?? null,
        },
      },
      { status: 201 },
    );
  } catch (err: any) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status },
    );
  }
}
