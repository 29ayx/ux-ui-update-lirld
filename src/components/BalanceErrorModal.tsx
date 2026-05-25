import { Show } from "solid-js";
import { Portal } from "solid-js/web";
import { A } from "@solidjs/router";
import { HiSolidXMark } from "solid-icons/hi";

interface BalanceErrorModalProps {
  isOpen: boolean;
  message: string;
  pricePerMinute?: number;
  onClose: () => void;
}

export default function BalanceErrorModal(props: BalanceErrorModalProps) {
  return (
    <Show when={props.isOpen}>
      <Portal>
        <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={props.onClose}
          />

          {/* Modal Content */}
          <div class="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 border border-white/20 dark:border-gray-800 animate-in slide-in-from-bottom-4">
            {/* Header */}
            <div class="relative p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
              <button
                onClick={props.onClose}
                class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <HiSolidXMark class="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-white">
                    Insufficient Credits
                  </h3>

                  
                  <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Add credits to make this call
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div class="p-6">
              <p class="text-slate-700 dark:text-slate-300 mb-4">
                {props.message}
              </p>

              <Show when={props.pricePerMinute !== undefined && props.pricePerMinute > 0}>
                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Call Rate:</span>
                    <span class="text-lg font-bold text-slate-900 dark:text-white">
                      {props.pricePerMinute} credits/min
                    </span>
                  </div>
                </div>
              </Show>

              {/* Action Buttons */}
              <div class="flex gap-3">
                <button
                  onClick={props.onClose}
                  class="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <A
                  href="/plans"
                  onClick={props.onClose}
                  class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl font-semibold transition-all text-center shadow-lg shadow-blue-600/30"
                >
                  Add Credits
                </A>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}

