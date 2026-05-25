import { JSX, Show, createSignal, onMount, onCleanup } from "solid-js";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "~/lib/firebase";

interface OnlineIndicatorProps {
  userId: string;
  size?: "sm" | "md" | "lg";
  children: JSX.Element;
}

export default function OnlineIndicator(props: OnlineIndicatorProps) {
  const [isOnline, setIsOnline] = createSignal(false);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  onMount(() => {
    if (!props.userId) return;

    // Listen to user document for online status
    const userRef = doc(db, "users", props.userId);
    const unsubscribe = onSnapshot(userRef, (userDoc) => {
      if (userDoc.exists()) {
        const data = userDoc.data();
        const lastSeen = data.lastSeen;
        const forcedOnline = data.forcedOnline;

        // Check if user is online
        if (forcedOnline === true) {
          setIsOnline(true);
        } else if (lastSeen) {
          // Consider online if lastSeen is within last 5 minutes
          let lastSeenTime: number;
          if (typeof lastSeen === 'number') {
            lastSeenTime = lastSeen;
          } else if (lastSeen && typeof lastSeen.toMillis === 'function') {
            // Firestore Timestamp
            lastSeenTime = lastSeen.toMillis();
          } else if (lastSeen && typeof lastSeen.seconds === 'number') {
            // Firestore Timestamp (alternative format)
            lastSeenTime = lastSeen.seconds * 1000;
          } else {
            setIsOnline(false);
            return;
          }
          const now = Date.now();
          const fiveMinutesAgo = now - 5 * 60 * 1000;
          setIsOnline(lastSeenTime > fiveMinutesAgo);
        } else {
          setIsOnline(false);
        }
      } else {
        setIsOnline(false);
      }
    }, (error) => {
      console.error("Error checking online status:", error);
      setIsOnline(false);
    });

    onCleanup(() => {
      unsubscribe();
    });
  });

  return (
    <div class="relative inline-block">
      {props.children}
      <Show when={isOnline()}>
        <div
          class={`absolute bottom-0 right-0 ${sizeClasses[props.size || "sm"]} bg-green-500 rounded-full border-2 border-black/50`}
        />
      </Show>
    </div>
  );
}
