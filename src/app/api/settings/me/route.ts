import { NextResponse } from "next/server";

import {
  updateMyProfile,
  UpdateMyProfileDto,
} from "@/lib/services/profile.service";

export async function PUT(request: Request) {
  try {
    const body: UpdateMyProfileDto = await request.json();

    // Delegate all business logic to the service layer
    const result = await updateMyProfile(body);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err: any) {
    const status = err.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json(
      { error: err.message || "Failed to update profile" },
      { status },
    );
  }
}
