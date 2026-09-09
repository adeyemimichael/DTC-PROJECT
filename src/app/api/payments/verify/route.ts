import { NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/services/paystack.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: "Transaction reference is required" },
        { status: 400 },
      );
    }

    await verifyPaystackTransaction(reference);

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 400 },
    );
  }
}
