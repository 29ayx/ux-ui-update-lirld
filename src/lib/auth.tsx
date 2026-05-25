import { createContext, useContext, createSignal, onMount, onCleanup, type JSX } from "solid-js";
import { auth, db } from "./firebase";
import { doc, onSnapshot, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { detectLocation, storeUserLocation, type DetectedLocation } from "./auth/locationDetection";

type AuthContextType = {
  user: () => User | null;
  profileCompleted: () => boolean;
  ready: () => boolean;
  setProfileCompleted: (value: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props: { children: JSX.Element }) {
  const [user, setUser] = createSignal<User | null>(null);
  const [profileCompleted, setProfileCompleted] = createSignal(false);
  const [ready, setReady] = createSignal(false);

  onMount(() => {
    let profileUnsubscribe: (() => void) | null = null;
    let detectedLocationCache: DetectedLocation | null = null;

    // Function to detect and store location for authenticated user
    const detectAndStoreLocation = async (userId: string) => {
      try {
        // Check if user already has location stored
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Only detect location if not already stored or if it's been more than 24 hours
          const locationUpdatedAt = userData.locationUpdatedAt?.toMillis?.();
          const shouldUpdate = !userData.location ||
            !locationUpdatedAt ||
            (Date.now() - locationUpdatedAt > 24 * 60 * 60 * 1000);

          if (shouldUpdate) {
            const location = await detectLocation();
            if (location) {
              detectedLocationCache = location;
              await storeUserLocation(userId, location);
              console.log('Location detected and stored for user:', userId);
            }
          } else {
            // Use existing location for lastSeen updates
            if (userData.location) {
              detectedLocationCache = {
                city: userData.location.city,
                country: userData.location.country,
                countryCode: userData.location.countryCode,
                region: userData.location.region,
              };
            }
          }
        }
      } catch (error) {
        console.error("Error detecting/storing location:", error);
        // Don't block auth flow on location detection failure
      }
    };

    // Set up auth state listener
    // onAuthStateChanged fires immediately with current user state
    const authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // Clean up previous profile listener
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      // Check profile completion in real-time
      if (currentUser) {
        // Detect and store location for authenticated user
        await detectAndStoreLocation(currentUser.uid);

        profileUnsubscribe = onSnapshot(
          doc(db, "users", currentUser.uid),
          (docSnapshot) => {
            const profileIsCompleted = docSnapshot.exists() && docSnapshot.data().profileCompleted;
            setProfileCompleted(profileIsCompleted);
            setReady(true);
          },
          (error) => {
            console.error("Error checking profile:", error);
            setProfileCompleted(false);
            setReady(true);
          }
        );
      } else {
        setProfileCompleted(false);
        setReady(true);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  });

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Request birthday scope to verify age
    provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value: AuthContextType = {
    user,
    profileCompleted,
    ready,
    setProfileCompleted,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

