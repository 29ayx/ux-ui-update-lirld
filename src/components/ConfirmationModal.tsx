import { Show } from "solid-js";
import { Portal } from "solid-js/web";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}

export default function ConfirmationModal(props: ConfirmationModalProps) {
    return (
        <Show when={props.isOpen}>
            <Portal>
                <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <div
                        class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={props.onCancel}
                    />

                    {/* Modal Content */}
                    <div class="relative w-full max-w-sm bg-whitedark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 border border-white/20 dark:border-gray-800">
                        <div class="p-6">
                            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                                {props.title}
                            </h3>
                            <p class="text-slate-600 dark:text-slate-300 text-sm mb-6">
                                {props.message}
                            </p>

                            <div class="flex gap-3 justify-end">
                                <button
                                    onClick={props.onCancel}
                                    class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    {props.cancelText || "Cancel"}
                                </button>
                                <button
                                    onClick={props.onConfirm}
                                    class={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-lg ${props.isDestructive
                                        ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                                        : "bg-[#007BFF] hover:bg-[#0056b3] shadow-blue-500/20"
                                        }`}
                                >
                                    {props.confirmText || "Confirm"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Portal>
        </Show>
    );
}
