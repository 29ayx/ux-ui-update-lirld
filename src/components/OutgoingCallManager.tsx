import { createEffect, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "~/lib/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "~/lib/firebase";
import type { Call } from "~/lib/calls";

/**
 * OutgoingCallManager - Global component that listens for outgoing calls
 * initiated by the current user and displays the CallModal
 */
export default function OutgoingCallManager() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Listen for outgoing calls
  createEffect(() => {
    const currentUser = user();
    if (!currentUser) return;



    // Query for calls where current user is the caller and status is 'ringing' or 'active'
    // Note: We use only where clauses to avoid needing a composite index
    const callsRef = collection(db, 'calls');
    const q = query(
      callsRef,
      where('callerId', '==', currentUser.uid),
      where('status', 'in', ['ringing', 'active'])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          // Get the most recent call (sort by createdAt client-side)
          // Filter out calls older than 15 seconds
          const now = Date.now() / 1000;
          const calls = snapshot.docs
            .map(doc => doc.data() as Call)
            .filter(call => {
              const createdAt = call.createdAt as any;
              if (!createdAt || !createdAt.seconds) return false;
              const age = now - createdAt.seconds;
              return age < 15;
            })
            .sort((a, b) => {
              const aTime = a.createdAt as any;
              const bTime = b.createdAt as any;
              if (!aTime || !bTime) return 0;
              return bTime.seconds - aTime.seconds;
            });
          
          if (calls.length > 0) {
            navigate(`/call/${calls[0].id}`);
          }
        }
      },
      (error) => {
        console.error('[OutgoingCallManager] Error:', error);
      }
    );

    onCleanup(() => unsubscribe());
  });

  return null;
}
