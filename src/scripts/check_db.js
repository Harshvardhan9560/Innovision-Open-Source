import { adminDb } from "../lib/firebase-admin.js";

async function checkCollections() {
    try {
        console.log("Checking 'published_courses'...");
        const pc = await adminDb.collection("published_courses").get();
        console.log(`- Count: ${pc.size}`);
        pc.docs.forEach(d => console.log(`  - ${d.id}: ${d.data().courseTitle} (status: ${d.data().status})`));

        console.log("\nChecking 'roadmaps' (global)...");
        const r = await adminDb.collection("roadmaps").get();
        console.log(`- Count: ${r.size}`);
        r.docs.slice(0, 5).forEach(d => console.log(`  - ${d.id}: ${d.data().title}`));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkCollections();
