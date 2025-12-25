import { auth } from "@/app/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, socialLinks } = body;

    const userRef = doc(db, "users", session.user.email);
    
    // Update user document
    await updateDoc(userRef, {
      name: name || "",
      bio: bio || "",
      socialLinks: socialLinks || {},
      updatedAt: new Date().toISOString()
    });

    // Fetch updated user data
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }

    return NextResponse.json(userSnap.data());
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}
