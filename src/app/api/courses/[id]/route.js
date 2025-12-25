import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Try published_courses collection first
    let courseRef = doc(db, "published_courses", id);
    let courseSnap = await getDoc(courseRef);

    // If not found, try courses collection
    if (!courseSnap.exists()) {
      courseRef = doc(db, "courses", id);
      courseSnap = await getDoc(courseRef);
    }

    if (!courseSnap.exists()) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseData = {
      id: courseSnap.id,
      ...courseSnap.data()
    };

    return NextResponse.json(courseData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
