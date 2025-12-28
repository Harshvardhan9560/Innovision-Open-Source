import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { isPremiumUser, getUserCourseCount, checkTrialStatus, checkFullAccess } from "@/lib/premium";

export async function GET(req) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPremium = await isPremiumUser(session.user.email);
    const courseCount = await getUserCourseCount(session.user.email);
    const trialStatus = await checkTrialStatus(session.user.email);
    const fullAccess = await checkFullAccess(session.user.email);

    return NextResponse.json({
      isPremium,
      courseCount,
      maxCourses: isPremium ? 100 : 3,
      // Trial info
      isInTrial: trialStatus.isInTrial,
      trialDaysRemaining: trialStatus.daysRemaining,
      trialExpired: trialStatus.trialExpired,
      // Full access (premium OR trial)
      hasFullAccess: fullAccess.hasAccess,
    });
  } catch (error) {
    console.error("Error checking premium status:", error);
    return NextResponse.json(
      { error: "Failed to check premium status" },
      { status: 500 }
    );
  }
}
