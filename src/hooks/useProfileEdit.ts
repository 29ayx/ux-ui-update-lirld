import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "~/lib/firebase";
import { useAuth } from "~/lib/auth";

interface ProfileSnapshot {
  name: string;
  photos: string[];
  tags: string[];
  customization: {
    lookingFor: string[];
    interests: string[];
    personalityTraits: string[];
    funFacts: string[];
    travelInterests: string[];
    favorites: Record<string, string>;
    room: string | null;
    badgeText: string;
  };
  showCustomBadge: boolean;
  age: number | null;
  showAge: boolean;
}

function createProfileSnapshot(data: any): ProfileSnapshot {
  return {
    name: data?.name || "",
    photos: data?.photos || [],
    tags: data?.tags || [],
    customization: {
      lookingFor: data?.customization?.lookingFor || [],
      interests: data?.customization?.interests || [],
      personalityTraits: data?.customization?.personalityTraits || [],
      funFacts: data?.customization?.funFacts || [],
      travelInterests: data?.customization?.travelInterests || [],
      favorites: data?.customization?.favorites || {},
      room: data?.customization?.room || null,
      badgeText: data?.customization?.badgeText || "",
    },
    showCustomBadge: data?.showCustomBadge || false,
    age: data?.age || null,
    showAge: data?.showAge !== false,
  };
}

export function useProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = createSignal<any>(null);
  const [initialSnapshot, setInitialSnapshot] = createSignal<ProfileSnapshot | null>(null);
  const [saving, setSaving] = createSignal(false);
  const [saved, setSaved] = createSignal(false);
  const [localChanges, setLocalChanges] = createSignal<any>({});

  onMount(() => {
    const currentUser = user();
    if (!currentUser) {
      navigate("/profile");
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", currentUser.uid),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setProfileData(data);

          if (!initialSnapshot()) {
            setInitialSnapshot(createProfileSnapshot(data));
          }
        } else {
          setProfileData(null);
        }
      },
      (error) => {
        console.error("Error listening to profile:", error);
      }
    );

    onCleanup(() => unsubscribe());
  });

  const toggleFeature = (feature: string) => {
    const currentLocal = localChanges()[feature];
    const currentDb = profileData()?.[feature];

    let currentEffective;
    if (currentLocal !== undefined) {
      currentEffective = currentLocal;
    } else {
      // Handle features that default to true
      if (feature === "showZodiac" || feature === "showBirthdayCard" || feature === "showAge") {
        currentEffective = currentDb !== false;
      } else {
        currentEffective = !!currentDb;
      }
    }

    setLocalChanges({ ...localChanges(), [feature]: !currentEffective });
  };

  const updateCustomText = (field: string, value: string) => {
    setLocalChanges({
      ...localChanges(),
      [`customization.${field}`]: value
    });
  };

  const updateCustomArray = (field: string, value: string[]) => {
    setLocalChanges({
      ...localChanges(),
      [`customization.${field}`]: value
    });
  };

  // Reset saved state when local changes are made
  createEffect(() => {
    const changes = localChanges();
    if (Object.keys(changes).length > 0 && saved()) {
      setSaved(false);
    }
  });

  const handleSave = async (selectedTheme: string | null) => {
    const currentUser = user();
    if (!currentUser) return;

    setSaving(true);
    setSaved(false);

    try {
      const currentData = profileData();
      const changes = localChanges();

      // Validate that at least 1 photo exists
      const finalPhotos = changes.photos ?? currentData?.photos ?? [];
      if (finalPhotos.length < 1) {
        throw new Error("At least 1 photo is required");
      }

      const updates: any = {
        ...currentData,
        updatedAt: new Date().toISOString()
      };
      Object.keys(changes).forEach(key => {
        if (key === 'displayName') {
          updates.name = changes[key];
        } else if (key.startsWith('customization.')) {
          const field = key.replace('customization.', '');
          updates.customization = {
            ...updates.customization,
            ...currentData?.customization,
            [field]: changes[key]
          };
        } else {
          updates[key] = changes[key];
        }
      });

      if (!updates.customization) {
        updates.customization = { ...currentData?.customization };
      }

      if (selectedTheme) {
        const themes = [
          { id: "light", name: "Light", background: "from-white via-white to-white", textColor: "text-black", primaryColor: "bg-yellow-400", frame: "minimal", animation: "none" },
          { id: "dark", name: "Dark", background: "from-[#000000] via-[#000000] to-[#000000]", textColor: "text-white", primaryColor: "bg-green-500", frame: "minimal", animation: "none" },
          { id: "simple", name: "Simple", background: "from-white via-white to-white", textColor: "text-black", primaryColor: "bg-gray-200", frame: "minimal", animation: "none" },
        ];
        const theme = themes.find(t => t.id === selectedTheme);
        if (theme) {
          updates.customization.room = JSON.stringify({
            theme: selectedTheme,
            background: theme.background,
            textColor: theme.textColor,
            primaryColor: theme.primaryColor,
            frame: theme.frame,
            animation: theme.animation
          });
        }
      }

      await updateDoc(doc(db, "users", currentUser.uid), updates);
      setInitialSnapshot(createProfileSnapshot(updates));
      setLocalChanges({});
      setSaved(true);
    } catch (error) {
      console.error("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  return {
    profileData,
    initialSnapshot,
    saving,
    saved,
    localChanges,
    setLocalChanges,
    toggleFeature,
    updateCustomText,
    updateCustomArray,
    handleSave
  };
}
