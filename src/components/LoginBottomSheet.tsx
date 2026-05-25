import { Show } from "solid-js";
import GoogleSignInButton from "./auth/GoogleSignInButton";

interface LoginBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginBottomSheet(props: LoginBottomSheetProps) {
    return (
        <Show when={props.isOpen}>
            {/* Backdrop */}
            <div
                class="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                onClick={props.onClose}
            />

            {/* Bottom Sheet */}
            <div
                class="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111] rounded-t-3xl z-50 transition-transform duration-300 ease-out"
                style={{
                    height: "50vh",
                    transform: props.isOpen ? "translateY(0)" : "translateY(100%)"
                }}
            >
                {/* Handle Bar */}
                <div class="flex justify-center pt-4 pb-2">
                    <div class="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </div>

                {/* Content */}
                <div class="px-6 py-8 flex flex-col items-center justify-center h-full">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Sign in to continue
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-8 text-center">
                        Create an account or sign in to start chatting
                    </p>

                    <div class="w-full max-w-sm">
                        <GoogleSignInButton
                            onSuccess={() => {
                                props.onClose();
                            }}
                        />
                    </div>
                </div>
            </div>
        </Show>
    );
}
