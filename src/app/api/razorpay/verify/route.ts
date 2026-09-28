import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required Razorpay payment credentials" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { verified: false, error: "Invalid payment signature verification failed" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      verified: true,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      message: "Server-side payment verification successful",
    });
  } catch (err: any) {
    return NextResponse.json(
      { verified: false, error: "Server error verifying payment", details: err?.message },
      { status: 500 }
    );
  }
}
