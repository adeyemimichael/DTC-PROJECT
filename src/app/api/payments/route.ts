import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/payments?purpose=registration
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("autherror", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("user", user);

    const { searchParams } = new URL(request.url);
    const purpose = searchParams.get("purpose");

    const supabaseAdmin = createAdminClient();

    let query = supabaseAdmin
      .from("payments")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

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
