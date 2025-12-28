import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { activatePremium } from "@/lib/premium";
import crypto from "crypto";

export async function POST(req) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Activate premium for 1 month
    const success = await activatePremium(session.user.email, 1, razorpay_payment_id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to activate premium" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Premium activated successfully!",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
