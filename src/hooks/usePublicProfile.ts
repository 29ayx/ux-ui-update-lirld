import { createSignal, createEffect, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "~/lib/auth";
import { db } from "~/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function usePublicProfile(userId: string | undefined | (() => string | undefined)) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = createSignal<any>(null);
  const [notFound, setNotFound] = createSignal(false);

  createEffect(() => {
    const id = typeof userId === "function" ? userId() : userId;

    if (!id) {
      setNotFound(true);
      return;
    }
    
    if (currentUser()?.uid === id) {
      navigate("/profile", { replace: true });
      return;
    }

    // Reset status for new ID
    setProfileData(null);
    setNotFound(false);

    const userRef = doc(db, "users", id);
    
    const unsubscribe = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          setNotFound(true);
          return;
        }
        setProfileData(docSnapshot.data() || {});
      },
      (error) => {
        console.error("Error loading profile:", error);
        setNotFound(true);
      }
    );

    onCleanup(() => {
      unsubscribe();
    });
  });

  return {
    profileData,
    notFound
  };
}
