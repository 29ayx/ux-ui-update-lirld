import { createSignal, createEffect, onCleanup } from "solid-js";
import { db } from "~/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export interface ViewedAccount {
    id: string;
    viewedUserId: string;
    viewedUserName: string;
    viewedUserPhoto: string;
    viewCount: number;
    lastViewedAt: number;
}

/**
 * Hook to fetch accounts viewed by the current user in real-time
 * @param userId - The ID of the current user or a function returning it
 * @param limitCount - Maximum number of accounts to fetch
 */
export function useViewedAccounts(userId: string | (() => string | undefined) | undefined, limitCount: number = 50) {
    const [viewedAccounts, setViewedAccounts] = createSignal<ViewedAccount[]>([]);
    const [loading, setLoading] = createSignal(true);

    createEffect(() => {
        const id = typeof userId === 'function' ? userId() : userId;

        if (!id) {
            console.log("[useViewedAccounts] No userId available yet");
            setLoading(false);
            return;
        }

        console.log("[useViewedAccounts] Subscribing to viewed accounts for:", id);
        setLoading(true);

        // Query from the user's own 'viewed' subcollection
        const viewedRef = collection(db, "users", id, "viewed");
        const vQuery = query(
            viewedRef,
            orderBy('lastViewedAt', 'desc'),
            limit(limitCount)
        );

        const unsubscribe = onSnapshot(
            vQuery,
            (snapshot) => {
                const accounts: ViewedAccount[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const viewedUserName = data.viewedUserName || "";

                    // Filter out deleted users (shown as "unknown" or empty)
                    if (viewedUserName.toLowerCase() === "unknown" || viewedUserName.trim() === "") {
                        return;
                    }

                    accounts.push({
                        id: doc.id,
                        viewedUserId: data.viewedUserId,
                        viewedUserName: viewedUserName,
                        viewedUserPhoto: data.viewedUserPhoto,
                        viewCount: data.viewCount,
                        lastViewedAt: data.lastViewedAt?.toMillis?.() || Date.now(),
                    });
                });

                console.log(`[useViewedAccounts] Fetched ${accounts.length} viewed accounts (deleted users filtered out)`);
                setViewedAccounts(accounts);
                setLoading(false);
            },
            (error) => {
                console.error("[useViewedAccounts] Error:", error);
                setViewedAccounts([]);
                setLoading(false);
            }
        );

        onCleanup(() => {
            console.log("[useViewedAccounts] Unsubscribing from viewed accounts");
            unsubscribe();
        });
    });

    return { viewedAccounts, loading };
}
