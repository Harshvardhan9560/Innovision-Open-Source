import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = params;

    // Check if user is already enrolled
    const roadmapsRef = collection(db, "users", session.user.email, "roadmaps");
    const enrollmentQuery = query(roadmapsRef, where("courseId", "==", courseId));
    const existingEnrollment = await getDocs(enrollmentQuery);

    if (!existingEnrollment.empty) {
      const existingRoadmap = existingEnrollment.docs[0];
      return NextResponse.json({
        success: true,
        roadmapId: existingRoadmap.id,
        message: "You are already enrolled in this course",
        alreadyEnrolled: true
      });
    }

    // Fetch course from published_courses
    const courseRef = doc(db, "published_courses", courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseData = courseSnap.data();
    const chapters = courseData.chapters || [];

    // Create roadmap
    const roadmapId = `${Date.now()}`;
    const roadmapRef = doc(db, "users", session.user.email, "roadmaps", roadmapId);

    await setDoc(roadmapRef, {
      userId: session.user.email,
      courseId: courseId,
      courseTitle: courseData.title || "Untitled Course",
      courseDescription: courseData.description || "",
      chapters: chapters.map((ch, idx) => ({
        chapterNumber: idx + 1,
        chapterTitle: ch.title || `Chapter ${idx + 1}`,
        chapterDescription: ch.description || "",
        completed: false
      })),
      completed: false,
      process: "completed",
      createdAt: new Date().toISOString(),
      enrolledAt: new Date().toISOString(),
      isStudioCourse: true // Mark as Studio course
    });

    // Create chapter subcollections with actual content
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const chapterNum = (i + 1).toString();
      
      const chapterRef = doc(
        db,
        "users",
        session.user.email,
        "roadmaps",
        roadmapId,
        "chapters",
        chapterNum
      );
      
      await setDoc(chapterRef, {
        content: chapter.content || "",
        title: chapter.title || `Chapter ${i + 1}`,
        chapterNumber: i + 1,
        process: "completed",
        createdAt: new Date().toISOString()
      });
      
      // Create tasks document
      const tasksRef = doc(
        db,
        "users",
        session.user.email,
        "roadmaps",
        roadmapId,
        "chapters",
        chapterNum,
        "tasks",
        "task"
      );
      
      await setDoc(tasksRef, {});
    }

    return NextResponse.json({
      success: true,
      roadmapId: roadmapId,
      message: "Successfully enrolled in course"
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Failed to enroll in course", 
        details: error.message
      },
      { status: 500 }
    );
  }
}
