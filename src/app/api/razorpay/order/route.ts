import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt } = body;

    // If Razorpay SDK/keys are configured in .env, create order with Razorpay API
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100, // amount in paise
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
        }),
      });
      const data = await rzpRes.json();
      return NextResponse.json(data);
    }

    // Default verified simulated order for local dev and demo testing
    const orderId = `order_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    return NextResponse.json({
      id: orderId,
      entity: "order",
      amount: amount * 100,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: "created",
      created_at: Math.floor(Date.now() / 1000),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to create Razorpay order", details: err?.message },
      { status: 500 }
    );
  }
}
