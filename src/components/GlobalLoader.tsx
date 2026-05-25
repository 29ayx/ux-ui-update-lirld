import { onMount, onCleanup } from "solid-js";

export default function GlobalLoader() {
    // Prevent scrolling while loading - Client-side only
    onMount(() => {
        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden';
        }
    });

    onCleanup(() => {
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
        }
    });

    return (
        <div class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-black transition-colors duration-500">
            {/* Background Decorative Glows */}
            <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-[120px] animate-pulse" />
            <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 1s" />

            <div class="relative flex flex-col items-center">
                {/* Logo Branding */}
                <h1 class="text-4xl lg:text-7xl font-black mb-8 tracking-tighter bg-gradient-to-r from-blue-800 via-blue-500 to-blue-900 bg-clip-text text-transparent animate-in fade-in zoom-in duration-700">
                    Lirld.com
                </h1>

                {/* Modern 2025 Loader - Minimalist & Sleek */}
                <div class="flex items-center gap-1.5 h-1">
                    <div class="w-12 h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-blue-700 to-blue-900 animate-[loading-bar_1.5s_infinite_ease-in-out]" />
                    </div>
                </div>

                {/* Subtext */}
                <p class="mt-6 text-md uppercase tracking-[0.2em] font-bold text-gray-400 dark:text-gray-600 animate-pulse">
                    Initializing Application
                </p>
            </div>

            <style>{`
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
