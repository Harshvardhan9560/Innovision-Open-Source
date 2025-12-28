import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { getServerSession } from "@/lib/auth-server";
import { canGenerateYouTubeCourse } from "@/lib/premium";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user can generate YouTube courses
    const eligibility = await canGenerateYouTubeCourse(session.user.email);
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

    const { title, summary, transcript } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Create a detailed course from this YouTube video:

Title: ${title}
Summary: ${JSON.stringify(summary)}
Transcript: ${transcript}

Generate a complete course with chapters, each containing:
- Title
- Description
- Key concepts
- Exercises

Return as JSON matching this structure:
{
  "title": "Course Title",
  "description": "Course description",
  "chapters": [
    {
      "title": "Chapter 1",
      "description": "Chapter description",
      "content": "Detailed content",
      "exercises": ["Exercise 1", "Exercise 2"]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const courseData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!courseData) {
      throw new Error("Failed to generate course");
    }

    // Save to Firebase under user's youtube-courses collection
    const docRef = await adminDb
      .collection("users")
      .doc(session.user.email)
      .collection("youtube-courses")
      .add({
        ...courseData,
        source: "youtube",
        videoTitle: title,
        createdAt: new Date().toISOString(),
        process: "completed",
      });

    // Award 10 XP for generating a course
    if (session?.user?.email) {
      try {
        const statsRef = adminDb.collection("gamification").doc(session.user.email);
        await adminDb.runTransaction(async (transaction) => {
          const statsDoc = await transaction.get(statsRef);
          const xpGained = 10;
          let stats = statsDoc.exists
            ? statsDoc.data()
            : {
                xp: 0,
                level: 1,
                streak: 1,
                badges: [],
                rank: 0,
                achievements: [],
                lastActive: new Date().toISOString(),
              };

          const newXP = (stats.xp || 0) + xpGained;
          const newLevel = Math.floor(newXP / 1000) + 1;

          transaction.set(
            statsRef,
            {
              ...stats,
              xp: newXP,
              level: newLevel,
              lastActive: new Date().toISOString(),
              achievements: [
                ...(stats.achievements || []),
                {
                  title: "New Course Generated!",
                  description: "You generated a new AI course",
                  xp: xpGained,
                  timestamp: new Date().toISOString(),
                },
              ],
            },
            { merge: true }
          );
        });
      } catch (xpError) {
        console.error("Failed to award YouTube course XP:", xpError);
      }
    }

    return NextResponse.json({ id: docRef.id, ...courseData });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
