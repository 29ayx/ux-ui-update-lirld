import { createSignal, createEffect, onCleanup } from "solid-js";
import { db } from "~/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export interface ProfileViewer {
    id: string;
    viewerId: string;
    viewerName: string;
    viewerPhoto: string;
    viewCount: number;
    lastViewedAt: number;
}

/**
 * Hook to fetch profile viewers in real-time
 * @param userId - The user whose profile viewers to fetch
 * @param limitCount - Maximum number of viewers to fetch
 */
export function useProfileViewers(userId: string | (() => string | undefined) | undefined, limitCount: number = 50) {
    const [viewers, setViewers] = createSignal<ProfileViewer[]>([]);
    const [loading, setLoading] = createSignal(true);

    createEffect(() => {
        const id = typeof userId === 'function' ? userId() : userId;

        if (!id) {
            console.log("[useProfileViewers] No userId available yet");
            setLoading(false);
            return;
        }

        console.log("[useProfileViewers] Subscribing to viewers for:", id);
        setLoading(true);

        const viewersRef = collection(db, `profileViews/${id}/viewers`);
        const q = query(
            viewersRef,
            orderBy("lastViewedAt", "desc"),
            limit(limitCount)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const viewersList: ProfileViewer[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const viewerName = data.viewerName || "";

                    // Filter out deleted users (shown as "unknown" or empty)
                    if (viewerName.toLowerCase() === "unknown" || viewerName.trim() === "") {
                        return;
                    }

                    viewersList.push({
                        id: doc.id,
                        viewerId: data.viewerId,
                        viewerName: viewerName,
                        viewerPhoto: data.viewerPhoto,
                        viewCount: data.viewCount,
                        lastViewedAt: data.lastViewedAt?.toMillis?.() || Date.now(),
                    });
                });
                console.log(`[useProfileViewers] Fetched ${viewersList.length} viewers (deleted users filtered out)`);
                setViewers(viewersList);
                setLoading(false);
            },
            (error) => {
                console.error("[useProfileViewers] Error:", error);
                setViewers([]);
                setLoading(false);
            }
        );

        onCleanup(() => {
            console.log("[useProfileViewers] Unsubscribing from viewers");
            unsubscribe();
        });
    });

    return { viewers, loading };
}
