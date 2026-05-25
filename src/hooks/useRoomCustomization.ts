import { createMemo } from "solid-js";

export function useRoomCustomization(profileData: () => any) {
  const roomData = createMemo(() => {
    const data = profileData();
    if (!data) return { theme: "minimal", background: "from-zinc-950 via-zinc-900 to-zinc-950", frame: "minimal", animation: "none" };

    const room = data?.customization?.room;
    if (!room) return { theme: "minimal", background: "from-zinc-950 via-zinc-900 to-zinc-950", frame: "minimal", animation: "none" };

    try {
      return typeof room === 'string' ? JSON.parse(room) : room;
    } catch {
      return { theme: "minimal", background: "from-zinc-950 via-zinc-900 to-zinc-950", frame: "minimal", animation: "none" };
    }
  });

  const roomBackground = createMemo(() => roomData()?.background || "from-zinc-950 via-zinc-900 to-zinc-950");
  const roomFrame = createMemo(() => roomData()?.frame || "minimal");
  const roomAnimation = createMemo(() => roomData()?.animation || "none");
  const roomTheme = createMemo(() => roomData()?.theme || "minimal");

  const vibeData = createMemo(() => {
    const data = profileData();
    if (!data) return null;

    const vibe = data?.customization?.vibe;
    if (!vibe) return null;

    try {
      return typeof vibe === 'string' ? JSON.parse(vibe) : vibe;
    } catch {
      return null;
    }
  });

  return {
    roomBackground,
    roomFrame,
    roomAnimation,
    roomTheme,
    vibeData
  };
}
