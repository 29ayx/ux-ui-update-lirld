import { Show } from "solid-js";

interface DiscardDialogProps {
  show: boolean;
  onDiscard: () => void;
  onCancel: () => void;
}

export default function DiscardDialog(props: DiscardDialogProps) {
  return (
    <Show when={props.show}>
      <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4" onClick={props.onCancel}>
        <div class="bg-[#111] rounded-xl p-4 w-full max-w-sm border border-white/10" onClick={(e) => e.stopPropagation()}>
          <p class="text-white text-sm mb-3">Unsaved changes</p>
          <div class="flex gap-2">
            <button
              onClick={props.onDiscard}
              class="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg text-sm font-medium active:bg-white/20 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={props.onCancel}
              class="flex-1 px-3 py-2 bg-white text-black rounded-lg text-sm font-semibold active:bg-white/90 transition-colors"
            >
              Keep Editing
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
