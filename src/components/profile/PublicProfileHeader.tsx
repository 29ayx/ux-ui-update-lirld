import { useNavigate } from "@solidjs/router";

export default function PublicProfileHeader() {
    const navigate = useNavigate();

    return (
        <header class="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-zinc-800/50">
            <div class="flex flex-row items-center gap-3 sm:gap-4 md:gap-5 max-w-6xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-2.5 sm:py-3 md:py-3.5 lg:py-4">
                <button
                    onClick={() => navigate(-1)}
                    class="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-black/5 dark:bg-white/10 rounded-full transition-all touch-manipulation hover:bg-black/10 dark:hover:bg-white/20 backdrop-blur-md"
                    aria-label="Go back"
                >
                    <svg
                        class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black dark:text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>
                <div class="flex flex-col">
                    <h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter bg-gradient-to-r from-pink-500 via-rose-500 to-violet-600 bg-clip-text text-transparent">
                        Lirld.com
                    </h1>
                    <span class="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-400 dark:text-zinc-500">Always feel connected</span>
                </div>
            </div>
        </header>
    );
}
