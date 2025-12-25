import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const userRef = doc(db, "gamification", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Initialize new user with streak of 0 (no activity yet)
      const initialStats = {
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
        rank: 0,
        achievements: [],
        lastActive: new Date().toISOString()
      };
      
      await setDoc(userRef, initialStats);
      return NextResponse.json(initialStats);
    }

    const stats = userDoc.data();
    
    // Check if streak should be reset (only check, don't update)
    const lastActive = new Date(stats.lastActive);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastActive.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    // If more than 1 day has passed without activity, streak is broken
    if (daysDiff > 1 && stats.streak > 0) {
      stats.streak = 0;
      await updateDoc(userRef, { 
        streak: 0
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId, action, value } = await request.json();

    const userRef = doc(db, "gamification", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stats = userDoc.data();
    
    // Award XP based on action (removed daily_login)
    const xpRewards = {
      complete_chapter: 100,
      complete_course: 500,
      perfect_quiz: 200,
      help_student: 75,
      view_course: 10,
      complete_lesson: 50,
      correct_answer: 2  // 2 XP per correct answer
    };

    const xpGained = xpRewards[action] || value || 0;
    const newXP = stats.xp + xpGained;
    const newLevel = Math.floor(newXP / 1000) + 1;

    // Update streak for actual learning activities only
    let currentStreak = stats.streak || 0;
    const learningActions = ['complete_chapter', 'complete_course', 'perfect_quiz', 'complete_lesson', 'view_course', 'correct_answer'];
    
    if (learningActions.includes(action)) {
      const lastActive = stats.lastActive ? new Date(stats.lastActive) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (!lastActive) {
        // First time doing a learning activity
        currentStreak = 1;
      } else {
        lastActive.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
          // Same day, keep current streak (don't increment)
          currentStreak = stats.streak || 0;
        } else if (daysDiff === 1) {
          // Consecutive day, increment streak
          currentStreak = (stats.streak || 0) + 1;
        } else if (daysDiff > 1) {
          // Streak broken, start fresh at 1
          currentStreak = 1;
        }
      }
    } else {
      // Not a learning action, keep current streak unchanged
      currentStreak = stats.streak || 0;
    }

    // Check for new badges
    const newBadges = checkBadges(stats, action);

    const updates = {
      xp: newXP,
      level: newLevel,
      streak: currentStreak,
      badges: [...new Set([...stats.badges, ...newBadges])],
      achievements: [
        ...stats.achievements,
        {
          title: getAchievementTitle(action),
          description: getAchievementDescription(action),
          xp: xpGained,
          timestamp: new Date().toISOString()
        }
      ],
      lastActive: new Date().toISOString()
    };

    await updateDoc(userRef, updates);

    return NextResponse.json({ 
      success: true, 
      xpGained,
      currentStreak,
      newLevel: newLevel > stats.level,
      newBadges
    });
  } catch (error) {
    console.error("Error updating stats:", error);
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}

function checkBadges(stats, action) {
  const badges = [];
  
  if (action === "complete_course" && !stats.badges.includes("first_course")) {
    badges.push("first_course");
  }
  
  if (stats.streak >= 7 && !stats.badges.includes("week_streak")) {
    badges.push("week_streak");
  }
  
  if (action === "perfect_quiz" && !stats.badges.includes("perfect_score")) {
    badges.push("perfect_score");
  }
  
  if (stats.level >= 10 && !stats.badges.includes("master")) {
    badges.push("master");
  }
  
  return badges;
}

function getAchievementTitle(action) {
  const titles = {
    complete_chapter: "Chapter Complete!",
    complete_course: "Course Mastered!",
    perfect_quiz: "Perfect Score!",
    help_student: "Helpful Hand",
    view_course: "Course Viewed!",
    complete_lesson: "Lesson Complete!",
    correct_answer: "Correct Answer!"
  };
  return titles[action] || "Achievement Unlocked!";
}

function getAchievementDescription(action) {
  const descriptions = {
    complete_chapter: "You completed a chapter",
    complete_course: "You completed an entire course",
    perfect_quiz: "You scored 100% on a quiz",
    help_student: "You helped another student",
    view_course: "You viewed a course",
    complete_lesson: "You completed a lesson",
    correct_answer: "You answered correctly"
  };
  return descriptions[action] || "You earned an achievement";
}
