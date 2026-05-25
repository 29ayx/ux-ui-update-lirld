import { Show } from "solid-js";

interface SaveButtonProps {
  saving: boolean;
  saved: boolean;
  disabled: boolean;
  onSave: () => void;
}

export default function SaveButton(props: SaveButtonProps) {
  return (
    <>
      <button
        onClick={props.onSave}
        disabled={props.saving || props.disabled}
        classList={{
          "save-button": true,
          "save-button-saved": props.saved && !props.saving,
          "save-button-saving": props.saving,
          "save-button-disabled": props.disabled && !props.saving
        }}
      >
        <Show when={props.saving}>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Saving...</span>
          </div>
        </Show>
        <Show when={props.saved && !props.saving}>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>Profile Updated!</span>
          </div>
        </Show>
        <Show when={!props.saving && !props.saved}>
          <div class="flex items-center gap-2">
            <span class="font-bold">Save Changes</span>
          </div>
        </Show>
      </button>

      <style>{`
        .save-button {
          width: 100%;
          padding: 1.1rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-weight: 700;
          border-radius: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 1.1rem;
          touch-action: manipulation;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .save-button:active:not(:disabled) {
          transform: scale(0.96);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
        }

        .save-button:hover:not(:disabled) {
          filter: brightness(1.1);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
        }

        .save-button-saved {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4) !important;
        }

        .save-button-saving {
          background: #3b82f6;
          opacity: 0.8;
          cursor: wait;
        }

        .save-button-disabled {
          background: #e2e8f0 !important;
          color: #94a3b8 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          border-color: transparent !important;
        }

        @keyframes checkPop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          70% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .check-icon {
          animation: checkPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </>
  );
}

