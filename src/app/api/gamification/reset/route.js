import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

/**
 * Reset gamification stats for a user
 * Usage: POST /api/gamification/reset
 * Body: { userId: "user@example.com" }
 */
export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const userRef = doc(db, "gamification", userId);
    const resetData = {
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      rank: 0,
      achievements: [],
      lastActive: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(userRef, resetData);
    
    return NextResponse.json({
      success: true,
      message: "Gamification stats reset to 0",
      data: resetData
    });

  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
