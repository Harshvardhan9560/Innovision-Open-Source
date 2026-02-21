import { adminDb } from "../lib/firebase-admin.js";

async function deepSearch() {
    try {
        console.log("=== Searching published_courses ===");
        const pc = await adminDb.collection("published_courses").get();
        console.log(`- Count: ${pc.size}`);
        pc.docs.forEach(d => console.log(`  - ${d.id}: ${d.data().courseTitle || d.data().title} (status: ${d.data().status})`));

        console.log("\n=== Searching global roadmaps ===");
        const r = await adminDb.collection("roadmaps").get();
        console.log(`- Count: ${r.size}`);
        r.docs.forEach(d => console.log(`  - ${d.id}: ${d.data().courseTitle || d.data().title}`));

        console.log("\n=== Searching for any public flags in user roadmaps ===");
        // This is expensive, just checking a few users if any
        const users = await adminDb.collection("users").limit(5).get();
        for (const userDoc of users.docs) {
            const userRoadmaps = await adminDb.collection("users").doc(userDoc.id).collection("roadmaps").get();
            userRoadmaps.docs.forEach(d => {
                if (d.data().isPublic || d.data().public) {
                    console.log(`  - Found public roadmap in ${userDoc.id}: ${d.data().courseTitle}`);
                }
            });
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

deepSearch();
