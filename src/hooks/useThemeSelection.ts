import { createSignal, createEffect } from "solid-js";

export const themes = [
  {
    id: "light",
    name: "Light",
    emoji: "☀️",
    background: "from-white via-white to-white",
    textColor: "text-black",
    primaryColor: "bg-yellow-400",
    frame: "minimal",
    animation: "none"
  },
  {
    id: "dark",
    name: "Dark",
    emoji: "🌙",
    background: "from-[#000000] via-[#000000] to-[#000000]",
    textColor: "text-white",
    primaryColor: "bg-green-500",
    frame: "minimal",
    animation: "none"
  },
  {
    id: "simple",
    name: "Simple",
    emoji: "⚪",
    background: "from-white via-white to-white",
    textColor: "text-black",
    primaryColor: "bg-gray-200",
    frame: "minimal",
    animation: "none"
  },
];

export function useThemeSelection(profileData: () => any) {
  const [selectedTheme, setSelectedTheme] = createSignal<string | null>(null);
  const [themeInitialized, setThemeInitialized] = createSignal(false);

  createEffect(() => {
    const currentRoom = profileData()?.customization?.room;
    if (currentRoom && !selectedTheme()) {
      const roomData = typeof currentRoom === 'string' ? JSON.parse(currentRoom) : currentRoom;
      const oldTheme = roomData?.theme;
      if (oldTheme === "light" || oldTheme === "dark" || oldTheme === "simple") {
        setSelectedTheme(oldTheme);
      } else {
        setSelectedTheme("simple");
      }
    } else if (!currentRoom && !selectedTheme()) {
      setSelectedTheme("simple");
    }
  });

  createEffect(() => {
    if (!themeInitialized() && profileData()) {
      setThemeInitialized(true);
    }
  });

  return {
    selectedTheme,
    setSelectedTheme,
    themeInitialized
  };
}
