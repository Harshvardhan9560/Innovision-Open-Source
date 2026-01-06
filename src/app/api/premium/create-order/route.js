import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import Razorpay from "razorpay";

// Secret coupons - don't expose these publicly
const COUPONS = {
  VICKY: { discount: 100, type: "percent" }, // 100% off = FREE
  SANJANA: { discount: 100, type: "percent" }, // FREE
  VILAS: { discount: 100, type: "percent" }, // FREE
  BHUMI: { discount: 100, type: "percent" }, // FREE
  SNEHA: { discount: 100, type: "percent" }, // FREE
  SANIYA: { discount: 100, type: "percent" }, // FREE
  RAKESH: { discount: 100, type: "percent" }, // FREE
  VICKY15: { discount: 15, type: "percent" },
  VICKY20: { discount: 20, type: "percent" },
  VICKY50: { discount: 50, type: "percent" },
  LAUNCH10: { discount: 10, type: "percent" },
  STUDENT25: { discount: 25, type: "percent" },
};

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

    // Get plan type and coupon from request body
    let planType = "premium";
    let couponCode = null;
    try {
      const body = await req.json();
      planType = body.planType || "premium";
      couponCode = body.couponCode?.toUpperCase()?.trim() || null;
    } catch {
      // Default to premium if no body
    }

    // Set base amount based on plan type
    // Premium: ₹100 (10000 paise)
    // Education: ₹50 (5000 paise) - 50% off
    let baseAmount = planType === "education" ? 5000 : 10000;
    let discountApplied = 0;
    let couponValid = false;

    // Apply coupon if provided
    if (couponCode && COUPONS[couponCode]) {
      const coupon = COUPONS[couponCode];
      if (coupon.type === "percent") {
        discountApplied = Math.round((baseAmount * coupon.discount) / 100);
      } else {
        discountApplied = coupon.discount * 100; // Convert to paise
      }
      couponValid = true;
    }

    const finalAmount = Math.max(baseAmount - discountApplied, 100); // Minimum ₹1
    const planLabel = planType === "education" ? "edu" : "prem";

    // Receipt must be max 40 characters
    const receipt = `${planLabel}_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: finalAmount,
      currency: "INR",
      receipt: receipt,
      notes: {
        email: session.user.email,
        type: planType === "education" ? "education_subscription" : "premium_subscription",
        planType: planType,
        couponCode: couponCode || "none",
        originalAmount: baseAmount,
        discountApplied: discountApplied,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      originalAmount: baseAmount,
      discountApplied: discountApplied,
      couponValid: couponValid,
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
