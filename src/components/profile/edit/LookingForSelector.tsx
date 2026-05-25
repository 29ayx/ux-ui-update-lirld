import { For } from "solid-js";

const lookingForOptions = [
  "Friends", "Dating", "Travel Buddies", "Gaming Partners", 
  "Study Partners", "Workout Buddies", "Coffee Chat", "Language Exchange"
];

interface LookingForSelectorProps {
  selectedOptions: string[];
  onToggle: (option: string) => void;
}

export default function LookingForSelector(props: LookingForSelectorProps) {
  return (
    <div class="space-y-3">
      <For each={lookingForOptions}>
        {(option) => {
          const isSelected = () => props.selectedOptions.includes(option);
          return (
            <button
              onClick={() => props.onToggle(option)}
              class={`w-full px-6 py-4 rounded-xl text-base font-medium transition-all touch-manipulation active:scale-[0.98] ${
                isSelected()
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-[#1a1a1a] text-white/70 border border-white/10"
              }`}
            >
              {option}
            </button>
          );
        }}
      </For>
    </div>
  );
}
