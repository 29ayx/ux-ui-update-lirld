import { Show } from "solid-js";

interface EditHeaderProps {
  hasUnsavedChanges: boolean;
  onBack: () => void;
}

export default function EditHeader(props: EditHeaderProps) {
  return (
    <div class="sticky top-0 z-50 bg-whitedark:bg-black border-b border-gray-400 backdrop-blur-xl">
      <div class="max-w-full mx-auto px-4">
        <div class="flex items-center gap-4 h-16">
          <button
            onClick={props.onBack}
            class="p-2 active:bg-white/10 rounded-lg transition-colors touch-manipulation"
            title="Back to Profile"
          >
            <svg class="w-6 h-6 text-slate-800 dark:text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Edit Profile</h1>
          <Show when={props.hasUnsavedChanges}>
            <span class="ml-auto text-xs text-amber-700 bg-amber-400/10 px-2 py-1 rounded-full">Unsaved changes</span>
          </Show>
        </div>
      </div>
    </div>
  );
}
