import { createSignal, onMount, onCleanup, For, Show } from "solid-js";
// @ts-ignore
import { Motion } from "@motionone/solid";
import { IoPulse, IoHeart, IoFlash, IoPeople } from "solid-icons/io";

export default function LiveVibes() {
    const [pulseLevel, setPulseLevel] = createSignal(75);
    const [activeUsers, setActiveUsers] = createSignal(Math.floor(Math.random() * 100) + 400);

    // Random events for the activity feed
    const [events, setEvents] = createSignal([
        "Matched with a Host",
        "Someone from UK joined",
        "New High-Definition Call",
        "Verified account joined",
    ]);

    onMount(() => {
        const interval = setInterval(() => {
            setPulseLevel(prev => Math.max(60, Math.min(100, prev + (Math.random() * 20 - 10))));
            setActiveUsers(prev => prev + (Math.random() > 0.5 ? 1 : -1));

            // Rotate events
            setEvents(prev => {
                const next = [...prev];
                const first = next.shift();
                if (first) next.push(first);
                return next;
            });
        }, 3000);
        onCleanup(() => clearInterval(interval));
    });

    return (
        <div class="my-10 px-2 sm:px-0">
            <div class="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-600 via-violet-600 to-rose-600 p-[1px] shadow-2xl shadow-violet-500/20">
                <div class="relative h-full w-full overflow-hidden rounded-[31px] bg-white dark:bg-zinc-950 px-6 py-8">

                    {/* Animated Background Mesh */}
                    <div class="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
                        <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-pink-500 blur-[100px] animate-pulse" />
                        <div class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600 blur-[100px] animate-pulse" style={{ "animation-delay": "2s" }} />
                    </div>

                    <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                        {/* Left: Global Pulse Meter */}
                        <div class="flex items-center gap-6">
                            <div class="relative">
                                <div class="w-20 h-20 rounded-full border-4 border-zinc-100 dark:border-zinc-800 flex items-center justify-center relative">
                                    <IoPulse class="w-10 h-10 text-rose-500 animate-pulse" />

                                    {/* Outer Rings */}
                                    <div class="absolute inset-0 rounded-full border-2 border-rose-500/30 animate-ping" />
                                    <div class="absolute inset-[-8px] rounded-full border border-violet-500/20 animate-ping" style={{ "animation-delay": "0.5s" }} />
                                </div>
                                <div class="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white dark:border-zinc-950" />
                            </div>

                            <div>
                                <h3 class="text-xl font-black italic tracking-tighter text-zinc-900 dark:text-white uppercase leading-none mb-1">
                                    Global Energy
                                </h3>
                                <div class="flex items-center gap-2">
                                    <div class="w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <Motion.div
                                            transition={{ duration: 0.5 }}
                                            animate={{ width: `${pulseLevel()}%` }}
                                            class="h-full bg-gradient-to-r from-rose-500 to-violet-600"
                                        />
                                    </div>
                                    <span class="text-[10px] font-black text-rose-500">{Math.floor(pulseLevel())}%</span>
                                </div>
                                <p class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-2 uppercase tracking-widest flex items-center gap-1">
                                    <IoPeople class="inline" /> {activeUsers()} Active Sessions
                                </p>
                            </div>
                        </div>

                        {/* Middle: Live Activity Scroller */}
                        <div class="flex-1 max-w-sm w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/50">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                <span class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Live Activity</span>
                            </div>
                            <div class="h-6 overflow-hidden relative">
                                <div class="transition-all duration-700 ease-in-out transform flex flex-col">
                                    <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                        {events()[0]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: CTA/Action */}
                        <div class="shrink-0">
                            <button class="px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-500/20 flex items-center gap-2">
                                <IoFlash class="w-4 h-4 text-amber-400" />
                                Boost Profile
                            </button>
                        </div>

                    </div>

                    {/* Floating Elements */}
                    <div class="absolute top-2 right-10 pointer-events-none opacity-20">
                        <IoHeart class="w-6 h-6 text-rose-500 animate-bounce" style={{ "animation-duration": "4s" }} />
                    </div>
                    <div class="absolute bottom-4 left-1/2 pointer-events-none opacity-20">
                        <IoHeart class="w-4 h-4 text-violet-500 animate-bounce" style={{ "animation-duration": "3s", "animation-delay": "1s" }} />
                    </div>

                </div>
            </div>
        </div>
    );
}
