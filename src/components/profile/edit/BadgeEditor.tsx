import { Show, createSignal, createEffect } from "solid-js";
import { RiFinanceVipFill } from 'solid-icons/ri'
import SpecialBadge from "../SpecialBadge";
interface BadgeEditorProps {
  badgeText: string;
  showCustomBadge: boolean;
  onBadgeTextChange: (value: string) => void;
  onVisibilityToggle: () => void;
}

export default function BadgeEditor(props: BadgeEditorProps) {
  const [badgeEnabled, setBadgeEnabled] = createSignal(props.showCustomBadge);

  // Sync with props when they change
  createEffect(() => {
    setBadgeEnabled(props.showCustomBadge);
  });

  const handleToggle = () => {
    props.onVisibilityToggle();
  };

  const MAX_LENGTH = 15;
  const remainingChars = () => MAX_LENGTH - props.badgeText.length;

  return (
    <div class="space-y-4">
      {/* Toggle Switch */}
      <div class="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-white/10">
        <span class="text-base font-medium text-white dark:text-white">Show Special Badge</span>
        <button
          onClick={handleToggle}
          class={`relative w-14 h-8 rounded-full transition-colors ${badgeEnabled() ? "bg-purple-500" : "bg-white/20"
            }`}
        >
          <div
            class={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${badgeEnabled() ? "translate-x-7" : "translate-x-1"
              }`}
          />
        </button>
      </div>

      {/* Badge Text Input */}
      <Show when={badgeEnabled()}>
        <div class="space-y-3">
          <div>
            <label class="text-base font-medium text-black dark:text-white mb-3 block">Badge Text</label>
            <input
              type="text"
              value={props.badgeText}
              onInput={(e) => props.onBadgeTextChange(e.currentTarget.value)}
              placeholder="e.g., VIP, Premium, Pro Member"
              maxLength={MAX_LENGTH}
              class="w-full px-6 py-4 bg-[#1a1a1a] text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base placeholder:text-white/30"
            />
            <div class="flex justify-between items-center mt-2">
              <p class="text-sm text-black dark:text-white">
                This badge will appear on your profile
              </p>
              <span class={`text-sm font-medium ${remainingChars() < 10 ? "text-orange-400" : "text-black dark:text-white"}`}>
                {remainingChars()}/{MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>
      </Show>

      {/* Preview */}
      <Show when={badgeEnabled() && props.badgeText.trim()}>
        <div class="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/30">
          <div class="text-xs text-purple-300/70 uppercase tracking-wider font-medium mb-2">Preview</div>
          <SpecialBadge text={props.badgeText} />
        </div>
      </Show>

      {/* Empty State */}
      <Show when={badgeEnabled() && !props.badgeText.trim()}>
        <div class="p-4 bg-white/5 rounded-xl border border-white/10">
          <p class="text-sm text-black dark:text-white text-center">
            Enter text above to see your badge preview
          </p>
        </div>
      </Show>
    </div>
  );
}
