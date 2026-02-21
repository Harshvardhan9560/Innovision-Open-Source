import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase credentials in .env.local");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

async function debugData() {
  try {
    console.log("--- Checking published_courses ---");
    const pubSnap = await db.collection("published_courses").get();
    console.log(`Count: ${pubSnap.size}`);
    pubSnap.docs.forEach(doc => {
      const data = doc.data();
      console.log(`- [${doc.id}] ${data.courseTitle || data.title} (Status: ${data.status})`);
    });

    console.log("\n--- Checking global roadmaps ---");
    const roadmapsSnap = await db.collection("roadmaps").get();
    console.log(`Count: ${roadmapsSnap.size}`);
    roadmapsSnap.docs.slice(0, 5).forEach(doc => {
        const data = doc.data();
        console.log(`- [${doc.id}] ${data.courseTitle || data.title}`);
    });

    // Check a specific user if possible (Vishal Raut)
    // We need the email. User's name is Vishal. Let's try to find them.
    console.log("\n--- Checking users ---");
    const usersSnap = await db.collection("users").get();
    for (const doc of usersSnap.docs) {
        console.log(`User: ${doc.id}`);
        // Check their roadmaps
        const userRoadmaps = await db.collection("users").doc(doc.id).collection("roadmaps").get();
        console.log(`  Roadmaps: ${userRoadmaps.size}`);
        userRoadmaps.docs.forEach(r => console.log(`    - ${r.data().courseTitle}`));
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

debugData();
