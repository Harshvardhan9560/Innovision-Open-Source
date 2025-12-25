import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ enrolled: false });
    }

    const { id: courseId } = params;

    // Check if user has a roadmap for this course
    const roadmapsRef = collection(db, "users", session.user.email, "roadmaps");
    const q = query(roadmapsRef, where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // User is enrolled - return the first roadmap ID
      const roadmapDoc = querySnapshot.docs[0];
      return NextResponse.json({
        enrolled: true,
        roadmapId: roadmapDoc.id
      });
    }

    return NextResponse.json({ enrolled: false });
  } catch (error) {
    return NextResponse.json({ enrolled: false });
  }
}
