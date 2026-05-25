import { db } from "~/lib/firebase";
import { doc, setDoc, serverTimestamp, increment, getDoc } from "firebase/firestore";

/**
 * Record a profile view
 * @param viewerId - ID of the user viewing the profile
 * @param viewedUserId - ID of the profile being viewed
 * @param viewerName - Name of the viewer
 * @param viewerPhoto - Photo URL of the viewer
 */
export async function recordProfileView(
    viewerId: string,
    viewedUserId: string,
    viewerName: string,
    viewerPhoto: string
): Promise<void> {
    // Don't record self-views
    if (viewerId === viewedUserId) {
        console.log("[recordProfileView] Skipping self-view for user:", viewerId);
        return;
    }

    console.log(`[recordProfileView] Recording view: ${viewerId} -> ${viewedUserId}`);

    try {
        // Fetch the viewed user's info to store in the view record
        const viewedUserDoc = await getDoc(doc(db, "users", viewedUserId));
        if (!viewedUserDoc.exists()) {
            console.warn(`[recordProfileView] Viewed user ${viewedUserId} not found in Firestore`);
        }

        const viewedUserData = viewedUserDoc.exists() ? viewedUserDoc.data() : null;
        const viewedUserName = viewedUserData?.name || viewedUserData?.displayName || "Unknown";
        const viewedUserPhoto = (viewedUserData?.photos && viewedUserData?.photos[0]) || viewedUserData?.photoURL || "";

        const viewData = {
            viewerId,
            viewedUserId,
            viewerName: viewerName || "Unknown",
            viewerPhoto: viewerPhoto || "",
            viewedUserName,
            viewedUserPhoto,
            lastViewedAt: serverTimestamp(),
        };

        // 1. Write to the VIEWED user's subcollection (so they know who viewed them)
        const viewRef = doc(db, `profileViews/${viewedUserId}/viewers/${viewerId}`);
        const viewDoc = await getDoc(viewRef);

        if (viewDoc.exists()) {
            console.log(`[recordProfileView] Updating existing view record for ${viewedUserId}`);
            await setDoc(viewRef, {
                ...viewData,
                viewCount: increment(1),
            }, { merge: true });
        } else {
            console.log(`[recordProfileView] Creating new view record for ${viewedUserId}`);
            await setDoc(viewRef, {
                ...viewData,
                viewCount: 1,
                firstViewedAt: serverTimestamp(),
            });
        }

        // 2. Write to the VIEWER'S own subcollection (so they know who they viewed)
        const myViewRef = doc(db, `users/${viewerId}/viewed/${viewedUserId}`);
        const myViewDoc = await getDoc(myViewRef);

        if (myViewDoc.exists()) {
            await setDoc(myViewRef, {
                ...viewData,
                viewCount: increment(1),
            }, { merge: true });
        } else {
            await setDoc(myViewRef, {
                ...viewData,
                viewCount: 1,
                firstViewedAt: serverTimestamp(),
            });
        }

        console.log("[recordProfileView] Success: Views recorded in both collections");
    } catch (error) {
        console.error("[recordProfileView] Detailed Error:", error);
    }
}
