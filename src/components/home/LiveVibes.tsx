import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { IoPulse, IoPeople, IoFlash } from "solid-icons/io";

export default function LiveVibes() {
    const [activeUsers, setActiveUsers] = createSignal(Math.floor(Math.random() * 80) + 70);

    // Random events for the activity feed
    const [events, setEvents] = createSignal([
        "Ai Recommendation Alogrithm ",
        "UNLIMITED Chats, UNLIMITED Match",
        "See profiles views free",
        "Earn money online, become host",
        "FREE Find nearby users around you",
    ]);

    onMount(() => {
        const interval = setInterval(() => {
            setActiveUsers(prev => prev + (Math.random() > 0.5 ? 1 : -1));

            // Rotate events
            setEvents(prev => {
                const next = [...prev];
                const first = next.shift();
                if (first) next.push(first);
                return next;
            });
        }, 4000);
        onCleanup(() => clearInterval(interval));
    });

    return (
        <div class="my-4 px-2 sm:px-0">
            <div class="h-[48px] relative overflow-hidden rounded-2xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/5 shadow-sm flex items-center px-3 sm:px-4 gap-2 sm:gap-4">

                {/* Animated Background Mesh (Very Subtle) */}
                <div class="absolute inset-0 opacity-5 pointer-events-none">
                    <div class="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-pink-500 to-transparent animate-pulse" />
                    <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-600 to-transparent animate-pulse" style={{ "animation-delay": "1s" }} />
                </div>

                {/* Live Indicator */}
                <div class="flex items-center gap-1.5 shrink-0">
                    <div class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </div>
                    <span class="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter text-rose-500">LIVE</span>
                </div>

                {/* Divider */}
                <div class="h-3 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0" />

                {/* Pulse Stats */}
                <div class="flex items-center gap-1.5 shrink-0">
                    <IoPulse class="w-3.5 h-3.5 text-violet-500 animate-pulse" />
                    <span class="text-[10px] font-bold dark:text-zinc-300 flex items-center gap-1 whitespace-nowrap">
                        <span class="hidden sm:inline text-zinc-400 dark:text-zinc-500 font-medium tracking-wide italic">ACTIVITY:</span>
                        {activeUsers()}
                    </span>
                </div>

                {/* Divider - Hide on very small screens */}
                <div class="hidden xs:block h-3 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0" />

                {/* Live Event Ticker */}
                <div class="flex-1 min-w-0 h-5 relative overflow-hidden">
                    <div class="h-full flex flex-col justify-center">
                        <p class="text-[10px] sm:text-[11px] font-black italic tracking-tight text-zinc-900 dark:text-white truncate uppercase max-w-full">
                            {events()[0]}
                        </p>
                    </div>
                </div>

                {/* End Badge: Platform Stat */}
                <div class="hidden md:flex items-center gap-2 shrink-0 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full">
                    <IoPeople class="w-3 h-3 text-zinc-400" />
                    <span class="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Global</span>
                </div>

            </div>
        </div>
    );
}
