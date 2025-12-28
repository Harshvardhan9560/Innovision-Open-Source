import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import Razorpay from "razorpay";

export async function POST(req) {
  try {
    // Check if Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys not configured");
      return NextResponse.json(
        { error: "Payment gateway not configured", details: "Missing Razorpay API keys" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", details: "Please login to continue" },
        { status: 401 }
      );
    }

    // Get plan type from request body
    let planType = "premium";
    try {
      const body = await req.json();
      planType = body.planType || "premium";
    } catch {
      // Default to premium if no body
    }

    // Set amount based on plan type
    // Premium: ₹100 (10000 paise)
    // Education: ₹50 (5000 paise) - 50% off
    const amount = planType === "education" ? 5000 : 10000;
    const planLabel = planType === "education" ? "edu" : "prem";

    // Receipt must be max 40 characters
    const receipt = `${planLabel}_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: receipt,
      notes: {
        email: session.user.email,
        type: planType === "education" ? "education_subscription" : "premium_subscription",
        planType: planType,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      planType: planType,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error.message, error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
