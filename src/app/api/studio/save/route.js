import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "@/lib/auth-server";
import { canUseStudio } from "@/lib/premium";

export async function POST(request) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseData = await request.json();

    // Check if user can use Studio (only for new courses, not updates)
    if (!courseData.id) {
      const eligibility = await canUseStudio(session.user.email);
      if (!eligibility.canGenerate) {
        return NextResponse.json(
          {
            error: eligibility.reason,
            isPremium: eligibility.isPremium,
            count: eligibility.count,
            needsUpgrade: !eligibility.isPremium,
          },
          { status: 403 }
        );
      }
    }

    if (courseData.id) {
      // Update existing draft
      const docRef = adminDb
        .collection("users")
        .doc(session.user.email)
        .collection("studio-courses")
        .doc(courseData.id);
      await docRef.update({
        ...courseData,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        id: courseData.id,
        message: "Draft updated",
      });
    } else {
      // Create new draft
      const docRef = await adminDb
        .collection("users")
        .doc(session.user.email)
        .collection("studio-courses")
        .add({
          ...courseData,
          createdAt: new Date().toISOString(),
        });

      return NextResponse.json({
        success: true,
        id: docRef.id,
        message: "Draft saved",
      });
    }
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}
