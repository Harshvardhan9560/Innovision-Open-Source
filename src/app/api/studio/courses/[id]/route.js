import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const courseData = await request.json();
    
    const courseRef = doc(db, "published_courses", id);
    
    // Check if course exists
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }
    
    // Update the course
    await updateDoc(courseRef, {
      ...courseData,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Course updated successfully" 
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await deleteDoc(doc(db, "published_courses", id));
    
    return NextResponse.json({ 
      success: true, 
      message: "Course deleted successfully" 
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
