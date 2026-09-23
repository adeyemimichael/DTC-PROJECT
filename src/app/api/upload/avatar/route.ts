import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    if (!file) {
      return NextResponse.json(
        {
          error:
            "No file provided. Send a multipart/form-data request with a 'file' field.",
        },
        { status: 400 },
      );
    }

    // ── Validate mime type ────────────────────────────────────────────────────
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Allowed: jpeg, png, webp.`,
        },
        { status: 400 },
      );
    }

    // ── Validate file size (bucket limit: 2 MB) ───────────────────────────────
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: "Avatar image must be smaller than 2 MB." },
        { status: 400 },
      );
    }

    // MUST start with "{userId}/..." so the RLS INSERT policy passes.
    const extension = file.name.split(".").pop() ?? "jpg";
    const storagePath = `${user.id}/${Date.now()}.${extension}`;

    // ── Upload ────────────────────────────────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // ── Public URL (avatars is a public bucket — no signing needed) ───────────
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(storagePath);

    return NextResponse.json(
      { data: { path: storagePath, publicUrl } },
      { status: 201 },
    );
  } catch (err: any) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: err.message || "Avatar upload failed" },
      { status },
    );
  }
}
