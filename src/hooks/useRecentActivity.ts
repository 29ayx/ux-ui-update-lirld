import { createSignal, onMount, onCleanup } from "solid-js";
import { db } from "~/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

export interface PriorityActivity {
  id: string;
  userId: string;
  userName: string;
  photoUrl?: string;
  action: "wave" | "message";
  timestamp: number;
}

export function useRecentActivity(userId: string | undefined) {
  const [activities, setActivities] = createSignal<PriorityActivity[]>([]);

  onMount(() => {
    if (!userId) return;

    // Query interactions where recipientId matches current user
    // and timestamp is within last 30 minutes
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

    const q = query(
      collection(db, "interactions"),
      where("recipientId", "==", userId),
      where("timestamp", ">", thirtyMinutesAgo),
      orderBy("timestamp", "desc"),
      limit(3)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const acts: PriorityActivity[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          acts.push({
            id: doc.id,
            userId: data.senderId,
            userName: data.senderName,
            photoUrl: data.senderPhoto,
            action: data.action,
            timestamp: data.timestamp,
          });
        });
        setActivities(acts);
      },
      (error) => {
        console.error("Error fetching recent activities:", error);
        setActivities([]);
      }
    );

    onCleanup(() => unsubscribe());
  });

  return activities;
}
