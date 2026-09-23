import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/services/profile.service";

export async function GET() {
  try {
    const bundle = await getCurrentProfile();

    if (!bundle) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ data: bundle }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
