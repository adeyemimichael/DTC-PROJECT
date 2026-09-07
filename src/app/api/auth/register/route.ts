import { NextResponse } from "next/server";
import { registerPatient } from "@/lib/services/registration.service";

// POST /api/auth/register
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // We expect: email, password, firstName, lastName, phoneNumber, dob, gender, address, city
    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await registerPatient(body);

    return NextResponse.json(
      {
        success: true,
        data: result.user,
        paymentUrl: result.paymentUrl,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("Registration Error:", err);
    return NextResponse.json(
      { error: err.message || "Invalid request" },
      { status: 400 },
    );
  }
}
