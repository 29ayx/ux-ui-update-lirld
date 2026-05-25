import { Show } from "solid-js";

interface VisibilityTogglesProps {
  showZodiac: boolean;
  showBirthdayCard: boolean;
  showAge: boolean;
  age: number | null;
  zodiac: { emoji: string; name: string } | null;
  birthdayInfo: { month: string; day: number } | null;
  onToggleZodiac: () => void;
  onToggleBirthday: () => void;
  onToggleAge: () => void;
  onAgeChange: (age: number | null) => void;
}

export default function VisibilityToggles(props: VisibilityTogglesProps) {
  return (
    <div class="divide-y divide-black/5 dark:divide-white/10">
      <div class="py-5 flex items-start justify-between transition-colors touch-manipulation">
        <div class="flex-1 pr-4">
          <div class="text-base font-semibold text-black dark:text-white mb-1">Display Age</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-3">Set your age (minimum 19) and choose if others can see it.</div>

          <div class="flex items-center gap-4">
            <input
              type="number"
              min="19"
              max="100"
              value={props.age || ""}
              onInput={(e) => {
                const val = e.currentTarget.value;
                if (val === "") {
                  props.onAgeChange(null);
                } else {
                  props.onAgeChange(parseInt(val));
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              placeholder="e.g. 25"
              class="w-24 px-3 py-2 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
            />
            <Show when={props.showAge && props.age && props.age >= 19}>
              <span class="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                Visible as {props.age}
              </span>
            </Show>
          </div>
        </div>
        <div class="pt-1">
          <button
            onClick={props.onToggleAge}
            class={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors touch-manipulation ${props.showAge ? "bg-blue-600" : "bg-gray-300 dark:bg-white/20"
              }`}
          >
            <span
              class={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${props.showAge ? "translate-x-6" : "translate-x-1"
                }`}
            />
          </button>
        </div>
      </div>

      <div class="py-5 flex items-center justify-between transition-colors touch-manipulation">
        <div class="flex-1">
          <div class="text-base font-semibold text-black dark:text-white mb-1">Show Zodiac Sign</div>
          <Show when={props.showZodiac && props.zodiac}>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-lg">{props.zodiac?.emoji}</span>
              <span class="text-sm text-gray-600 dark:text-gray-300">{props.zodiac?.name}</span>
            </div>
          </Show>
        </div>
        <button
          onClick={props.onToggleZodiac}
          class={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors touch-manipulation ${props.showZodiac ? "bg-blue-600" : "bg-gray-300 dark:bg-white/20"
            }`}
        >
          <span
            class={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${props.showZodiac ? "translate-x-6" : "translate-x-1"
              }`}
          />
        </button>
      </div>

      <div class="py-5 flex items-center justify-between transition-colors touch-manipulation">
        <div class="flex-1">
          <div class="text-base font-semibold text-black dark:text-white mb-1">Show Birthday Card</div>
          <Show when={props.showBirthdayCard && props.birthdayInfo}>
            <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {props.birthdayInfo?.month} {props.birthdayInfo?.day}
            </div>
          </Show>
        </div>
        <button
          onClick={props.onToggleBirthday}
          class={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors touch-manipulation ${props.showBirthdayCard ? "bg-blue-600" : "bg-gray-300 dark:bg-white/20"
            }`}
        >
          <span
            class={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${props.showBirthdayCard ? "translate-x-6" : "translate-x-1"
              }`}
          />
        </button>
      </div>
    </div>

  );
}
