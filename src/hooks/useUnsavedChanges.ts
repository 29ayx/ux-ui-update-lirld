import { createSignal, createEffect } from "solid-js";

function arraysEqual(arr1: any[], arr2: any[], orderMatters: boolean = false): boolean {
  if (arr1.length !== arr2.length) return false;
  if (orderMatters) {
    return arr1.every((item, index) => item === arr2[index]);
  }
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((item, index) => item === sorted2[index]);
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

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
  };
}

function hasProfileChanges(initial: ProfileSnapshot, current: ProfileSnapshot): boolean {
  if (initial.name !== current.name) return true;
  if (!arraysEqual(initial.photos, current.photos, true)) return true;
  if (!arraysEqual(initial.tags, current.tags, false)) return true;
  if (!arraysEqual(initial.customization.lookingFor, current.customization.lookingFor, false)) return true;
  if (!arraysEqual(initial.customization.interests, current.customization.interests, false)) return true;
  if (!arraysEqual(initial.customization.personalityTraits, current.customization.personalityTraits, false)) return true;
  if (!arraysEqual(initial.customization.funFacts, current.customization.funFacts, false)) return true;
  if (!arraysEqual(initial.customization.travelInterests, current.customization.travelInterests, false)) return true;
  if (!deepEqual(initial.customization.favorites, current.customization.favorites)) return true;
  if (initial.customization.room !== current.customization.room) return true;

  return false;
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
    }
  };
}

export function useUnsavedChanges(
  initialSnapshot: () => ProfileSnapshot | null,
  profileData: () => any,
  localChanges: () => any,
  selectedTheme: () => string | null,
  themeInitialized: () => boolean,
  saved: () => boolean
) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = createSignal(false);

  createEffect(() => {
    const initial = initialSnapshot();
    const current = profileData();

    if (!initial || !current) {
      setHasUnsavedChanges(false);
      return;
    }

    const currentState = createProfileSnapshot(current);
    const changes = localChanges();

    Object.keys(changes).forEach(key => {
      if (key.startsWith('customization.')) {
        const field = key.replace('customization.', '') as keyof ProfileSnapshot['customization'];
        (currentState.customization as any)[field] = changes[key];
      } else if (key in currentState) {
        (currentState as any)[key] = changes[key];
      }
    });

    if (selectedTheme() && themeInitialized()) {
      const themes = [
        { id: "light", background: "from-white via-white to-white", textColor: "text-black", primaryColor: "bg-yellow-400", frame: "minimal", animation: "none" },
        { id: "dark", background: "from-[#000000] via-[#000000] to-[#000000]", textColor: "text-white", primaryColor: "bg-green-500", frame: "minimal", animation: "none" },
        { id: "simple", background: "from-white via-white to-white", textColor: "text-black", primaryColor: "bg-gray-200", frame: "minimal", animation: "none" },
      ];
      const themeId = selectedTheme()!;
      const theme = themes.find(t => t.id === themeId);
      if (theme) {
        currentState.customization.room = JSON.stringify({
          theme: themeId,
          background: theme.background,
          textColor: theme.textColor,
          primaryColor: theme.primaryColor,
          frame: theme.frame,
          animation: theme.animation
        });
      }
    }


    const hasChanges = hasProfileChanges(initial, currentState);
    setHasUnsavedChanges(hasChanges);
  });

  return {
    hasUnsavedChanges
  };
}
