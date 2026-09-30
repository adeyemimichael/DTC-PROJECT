import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/services - list all services (RLS handles filtering active vs all depending on user)
export async function GET() {
  const supabase = await createClient();

  try {
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (servicesError) {
      return NextResponse.json(
        { error: servicesError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: services }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// POST /api/services - Create a new service (Admin only, enforced by RLS but we also check for better UX)
export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    // 1. Authenticate the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch user profile to verify admin privileges for early rejection UX
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admins only can create services" },
        { status: 403 },
      );
    }

    // 3. Process request body
    const body = await request.json();
    const { name, description, duration_minutes, price, currency, is_active } =
      body;

    // 4. Perform database insert
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .insert([
        {
          name,
          description,
          duration_minutes,
          price,
          currency: currency || "NGN",
          is_active: is_active !== undefined ? is_active : true,
        },
      ])
      .select()
      .single();

    if (serviceError) {
      return NextResponse.json(
        { error: serviceError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: service }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// PUT /api/services?id=[id] - Update a service (Admin only)
export async function PUT(request: Request) {
  const supabase = await createClient();

  try {
    // 1. Authenticate the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify admin privileges
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admins only can update services" },
        { status: 403 },
      );
    }

    // 3. Get service ID from searchParams
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("id");

    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 },
      );
    }
    // 4. Extract fields from body
    const body = await request.json();
    const { name, description, duration_minutes, price, currency, is_active } =
      body;

    // 4. Build a dynamic update object (ignores fields that weren't provided)
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (duration_minutes !== undefined)
      updateData.duration_minutes = duration_minutes;
    if (price !== undefined) updateData.price = price;
    if (currency !== undefined) updateData.currency = currency;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Ensure they actually sent at least one field to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 },
      );
    }

    // 5. Perform database update using the clean object
    const { data: updatedService, error: updateError } = await supabase
      .from("services")
      .update(updateData)
      .eq("id", serviceId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ data: updatedService }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// DELETE /api/services?id=[id] - Remove a service (Admin only)
export async function DELETE(request: Request) {
  const supabase = await createClient();

  try {
    // 1. Authenticate the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify admin privileges
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admins only can delete services" },
        { status: 403 },
      );
    }

    // 3. Get service ID from searchParams
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("id");

    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 },
      );
    }

    // 4. Perform database deletion
    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Service deleted successfully" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
