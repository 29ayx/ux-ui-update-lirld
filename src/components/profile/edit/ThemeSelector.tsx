import { For } from "solid-js";
import { themes } from "~/hooks/useThemeSelection";

interface ThemeSelectorProps {
  selectedTheme: string | null;
  onSelect: (themeId: string) => void;
}

export default function ThemeSelector(props: ThemeSelectorProps) {
  return (
    <div class="space-y-3">
      <For each={themes}>
        {(theme) => {
          const isSelected = () => props.selectedTheme === theme.id;
          return (
            <button
              onClick={() => props.onSelect(theme.id)}
              class={`w-full px-6 py-4 rounded-xl border-2 transition-all touch-manipulation active:scale-[0.98] ${
                isSelected()
                  ? "border-white/30 shadow-lg bg-white/5"
                  : "border-white/10 bg-[#1a1a1a]"
              }`}
            >
              <div class="flex items-center gap-4">
                <span class="text-3xl">{theme.emoji}</span>
                <span class={`text-base font-medium ${isSelected() ? "text-white" : "text-white/70"}`}>
                  {theme.name}
                </span>
              </div>
            </button>
          );
        }}
      </For>
    </div>
  );
}
