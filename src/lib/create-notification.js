
export async function createNotification(adminDb, { userId, title, body, type = "system", link = null }) {
    if (!adminDb || !userId || !title || !body) return null;
    try {
        const docRef = await adminDb.collection("notifications").add({
            userId,
            title,
            body,
            type,
            link,
            read: false,
            createdAt: new Date(),
        });
        return docRef.id;
    } catch (error) {
        console.error("createNotification error:", error);
        return null;
    }
}
