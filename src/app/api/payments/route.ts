import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/payments
// - Admin: returns all payments with appointment + service + patient info
// - Patient: returns only their own payments
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Determine role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    const { searchParams } = new URL(request.url);
    const purpose = searchParams.get("purpose");

    // Admin gets a richer join; patients get their own records only
    const selectFields = isAdmin
      ? `*, appointments(id, scheduled_at, services(name)), patients!patient_id(full_name)`
      : `*`;

    let query = supabase
      .from("payments")
      .select(selectFields)
      .order("created_at", { ascending: false });

    // Restrict non-admins to their own payments
    if (!isAdmin) {
      query = query.eq("patient_id", user.id);
    }

    if (purpose) {
      query = query.eq("purpose", purpose);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch payments error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payments" },
      { status: 400 },
    );
  }
}
