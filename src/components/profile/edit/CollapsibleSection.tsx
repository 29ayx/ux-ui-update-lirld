import { Show, JSX } from "solid-js";

interface CollapsibleSectionProps {
  title: string;
  badge?: string | JSX.Element;
  expanded: boolean;
  onToggle: () => void;
  children: JSX.Element;
}

export default function CollapsibleSection(props: CollapsibleSectionProps) {
  return (
    <div class="bg-[#ffffff4d] rounded-2xl overflow-hidden">
      <button
        onClick={props.onToggle}
        class="w-full px-6 py-4 flex items-center bg-[#f5f5f0] dark:bg-black  justify-between active:bg-[#f5f5f0] transition-colors touch-manipulation"
      >
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{props.title}</h3>
          <Show when={props.badge}>
            {props.badge}
          </Show>
        </div>
        <svg
          class={`w-5 h-5 text-gray-900 dark:text-white transition-transform ${props.expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <Show when={props.expanded}>
        <div class="px-6 pb-6 border-t bg-none dark:bg-black border-white/10 pt-4">
          {props.children}
        </div>
      </Show>
    </div>
  );
}
