import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/lib/firebase";
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: roadmapId } = params;

    // Delete all chapter subcollections first
    const chaptersRef = collection(db, "users", session.user.email, "roadmaps", roadmapId, "chapters");
    const chaptersSnapshot = await getDocs(chaptersRef);
    
    for (const chapterDoc of chaptersSnapshot.docs) {
      // Delete tasks subcollection
      const tasksRef = collection(db, "users", session.user.email, "roadmaps", roadmapId, "chapters", chapterDoc.id, "tasks");
      const tasksSnapshot = await getDocs(tasksRef);
      for (const taskDoc of tasksSnapshot.docs) {
        await deleteDoc(taskDoc.ref);
      }
      
      // Delete chapter document
      await deleteDoc(chapterDoc.ref);
    }

    // Delete the roadmap document
    const roadmapRef = doc(db, "users", session.user.email, "roadmaps", roadmapId);
    await deleteDoc(roadmapRef);

    return NextResponse.json({
      success: true,
      message: "Successfully unenrolled from course"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to unenroll", details: error.message },
      { status: 500 }
    );
  }
}
