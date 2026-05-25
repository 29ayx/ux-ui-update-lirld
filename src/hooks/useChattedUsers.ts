import { createSignal, onMount, onCleanup } from "solid-js";
import { db } from "~/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

/**
 * Hook to fetch the set of user IDs the current user has chatted with.
 * @param userId - The ID of the current user
 */
export function useChattedUsers(userId: string | undefined) {
    const [chattedUserIds, setChattedUserIds] = createSignal<Set<string>>(new Set());
    const [loading, setLoading] = createSignal(true);

    onMount(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const chatsQuery = query(
            collection(db, "chats"),
            where("participants", "array-contains", userId)
        );

        const unsubscribe = onSnapshot(
            chatsQuery,
            (snapshot) => {
                const ids = new Set<string>();
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    // Skip if deleted by current user
                    if (data.deletedBy?.includes(userId)) return;

                    const participants = data.participants as string[];
                    participants.forEach((pId) => {
                        if (pId !== userId) {
                            ids.add(pId);
                        }
                    });
                });
                setChattedUserIds(ids);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching chatted users:", error);
                setLoading(false);
            }
        );

        onCleanup(() => unsubscribe());
    });

    return { chattedUserIds, loading };
}
