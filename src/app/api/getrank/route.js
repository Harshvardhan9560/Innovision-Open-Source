import { db } from "@/lib/firebase";
import { getDocs, collection } from "firebase/firestore";
import { auth } from "@/app/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    
    // Fetch from gamification collection (single source of truth for XP)
    const gamificationCol = collection(db, "gamification");
    const gamificationSnaps = await getDocs(gamificationCol);
    
    // Fetch user details from users collection
    const usersCol = collection(db, "users");
    const usersSnaps = await getDocs(usersCol);
    
    // Create a map of user details
    const usersMap = {};
    usersSnaps.docs.forEach((doc) => {
        usersMap[doc.id] = {
            name: doc.data().name,
            email: doc.data().email,
            image: doc.data().image
        };
    });
    
    // Combine gamification data with user details
    let xps = gamificationSnaps.docs.map((doc) => {
        const userId = doc.id;
        const userDetails = usersMap[userId] || {};
        return {
            xp: doc.data().xp || 0,
            email: userId,
            name: userDetails.name || "Unknown",
            image: userDetails.image || ""
        };
    });
    
    xps = xps.sort((a, b) => b.xp - a.xp);
    const rank = xps.findIndex((e) => e.email === session?.user.email) + 1;
    const leaderboard = xps.length >= 10 ? xps.slice(0, 11) : xps;
    
    return NextResponse.json({ rank, leaderboard });
}
