import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/utils/storage";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

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

    if (!file) {
      return NextResponse.json(
        {
          error:
            "No file provided. Send a multipart/form-data request with a 'file' field.",
        },
        { status: 400 },
      );
    }

    // ── Validate mime type (passports bucket allows jpeg, png, pdf) ───────────
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Allowed: jpeg, png.`,
        },
        { status: 400 },
      );
    }

    // ── Validate file size (bucket limit is 5 MB) ─────────────────────────────
    const maxBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: "Passport file must be smaller than 5 MB." },
        { status: 400 },
      );
    }

    // ── Build the storage path ─────────────────────────────────────────────────
    // MUST start with "{userId}/..." so the RLS INSERT policy passes.
    const extension = file.name.split(".").pop() ?? "jpg";
    const filename = `${Date.now()}.${extension}`;
    const storagePath = `${user.id}/${filename}`;

    // ── Upload ────────────────────────────────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("passports")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: true, // replace if a newer upload uses the same timestamp (edge case)
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const signedUrl = await getSignedUrl("passports", storagePath);

    return NextResponse.json(
      {
        data: {
          path: storagePath,
          signedUrl,
        },
      },
      { status: 201 },
    );
  } catch (err: any) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: err.message || "Passport upload failed" },
      { status },
    );
  }
}

