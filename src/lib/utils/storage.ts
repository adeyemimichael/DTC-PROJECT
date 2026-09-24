"use client"
import { createClient } from "../supabase/client";

export type PrivateBucket =
  | "passports"
  | "patient-uploads"
  | "medical-documents";

export async function getSignedUrl(
  bucket: PrivateBucket | string,
  storagePath: string | null | undefined,
  expiresInSeconds = 60 * 60 * 24, // 24 hours default
): Promise<string | null> {
  if (!storagePath) return null;

  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error) {
    console.error(
      `getSignedUrl [${bucket}]: failed to sign "${storagePath}":`,
      error.message,
    );
    return null;
  }

  return data.signedUrl;
}
