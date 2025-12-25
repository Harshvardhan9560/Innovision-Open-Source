// Analytics API for Instructor Dashboard
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get("instructorId");
    const timeRange = searchParams.get("timeRange") || "7d";

    if (!instructorId) {
      return NextResponse.json({ error: "Instructor ID required" }, { status: 400 });
    }

    // Fetch all users
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch gamification data (XP source of truth)
    const gamificationSnapshot = await getDocs(collection(db, "gamification"));
    const gamificationData = {};
    gamificationSnapshot.docs.forEach(doc => {
      gamificationData[doc.id] = doc.data();
    });

    // Merge user data with gamification data
    const usersWithXP = users.map(user => ({
      ...user,
      xp: gamificationData[user.email]?.xp || 0,
      level: gamificationData[user.email]?.level || 1,
      streak: gamificationData[user.email]?.streak || 0
    }));

    // Fetch all roadmaps/courses
    const roadmapsSnapshot = await getDocs(collection(db, "roadmaps"));
    const roadmaps = roadmapsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate time range
    const now = Date.now();
    const timeRanges = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
    };
    const startTime = now - (timeRanges[timeRange] || timeRanges["7d"]);

    // Filter users by time range if they have createdAt
    const recentUsers = usersWithXP.filter(user => 
      !user.createdAt || user.createdAt >= startTime
    );

    // Aggregate analytics
    const analytics = {
      overview: {
        totalStudents: usersWithXP.length,
        totalCourses: roadmaps.length,
        avgCompletionRate: 0,
        totalXpEarned: 0,
      },
      engagement: {
        dailyActiveUsers: [],
        avgSessionDuration: 300, // Default 5 min
        taskCompletionRate: 0,
      },
      performance: {
        avgScore: 0,
        topPerformers: [],
        strugglingStudents: [],
      },
      content: {
        popularCourses: [],
        difficultChapters: [],
      },
    };

    // Calculate total XP and completion rates
    let totalXp = 0;
    let totalCompletedCourses = 0;
    let totalCourses = 0;

    usersWithXP.forEach(user => {
      totalXp += user.xp || 0;
      
      // Count completed courses from user's roadmaps
      const userRoadmaps = roadmaps.filter(r => r.userId === user.email);
      totalCourses += userRoadmaps.length;
      totalCompletedCourses += userRoadmaps.filter(r => r.completed).length;
    });

    analytics.overview.totalXpEarned = totalXp;
    analytics.overview.avgCompletionRate = totalCourses > 0 
      ? totalCompletedCourses / totalCourses 
      : 0;

    // Calculate engagement metrics
    const usersWithActivity = usersWithXP.filter(u => u.xp > 0);
    analytics.engagement.taskCompletionRate = usersWithActivity.length / Math.max(usersWithXP.length, 1);

    // Top performers by XP - remove duplicates by email
    const uniqueUsers = usersWithXP.reduce((acc, user) => {
      const existing = acc.find(u => u.email === user.email);
      if (!existing) {
        acc.push(user);
      } else if ((user.xp || 0) > (existing.xp || 0)) {
        // Keep the one with higher XP
        const index = acc.indexOf(existing);
        acc[index] = user;
      }
      return acc;
    }, []);
    
    const sortedUsers = [...uniqueUsers]
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .slice(0, 10);
    
    analytics.performance.topPerformers = sortedUsers.map(user => {
      const userRoadmaps = roadmaps.filter(r => r.userId === user.email);
      
      if (userRoadmaps.length === 0) {
        return {
          userId: user.name || user.email || "Anonymous",
          xp: user.xp || 0,
          completionRate: 0,
        };
      }
      
      // Calculate real-time completion based on chapters and progress
      let totalChapters = 0;
      let completedChapters = 0;
      
      userRoadmaps.forEach(roadmap => {
        // Check if roadmap has progress data
        if (roadmap.progress && typeof roadmap.progress === 'object') {
          const progressEntries = Object.values(roadmap.progress);
          totalChapters += progressEntries.length;
          completedChapters += progressEntries.filter(p => p === true || p === 'completed').length;
        }
        
        // Also check chapters array
        const chapters = roadmap.chapters || roadmap.roadmap?.chapters || [];
        if (Array.isArray(chapters) && chapters.length > 0) {
          totalChapters += chapters.length;
          completedChapters += chapters.filter(ch => 
            ch.completed === true || ch.status === 'completed'
          ).length;
        }
        
        // If roadmap is marked as completed, count it
        if (roadmap.completed === true && totalChapters === 0) {
          totalChapters = 1;
          completedChapters = 1;
        }
      });
      
      const completionRate = totalChapters > 0 ? completedChapters / totalChapters : 0;
      
      return {
        userId: user.name || user.email || "Anonymous",
        xp: user.xp || 0,
        completionRate: completionRate,
      };
    });

    // Calculate average score (based on XP as proxy)
    const avgXp = totalXp / Math.max(usersWithXP.length, 1);
    analytics.performance.avgScore = Math.min(avgXp / 1000, 1); // Normalize to 0-1

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch analytics",
      details: error.message 
    }, { status: 500 });
  }
}
