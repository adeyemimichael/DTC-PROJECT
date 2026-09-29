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
      return NextResponse.json(
        { error: uploadsError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: uploads }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

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

    // ── 1. Upload file to storage ─────────────────────────────────────────────
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

    // ── 2. Insert DB record ───────────────────────────────────────────────────
    const { data: uploadRecord, error: dbError } = await supabase
      .from("patient_uploads")
      .insert([
        {
          patient_id: user.id, // Enforce patient's own ID
          file_type,
          category,
          storage_path: storagePath,
          description: description ?? null,
        },
      ])
      .select()
      .single();

    if (dbError) {
      // Note: In a production app, you might want to delete the uploaded file here if DB insert fails
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    return NextResponse.json({ data: uploadRecord }, { status: 201 });
  } catch (err: any) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status },
    );
  }
}
