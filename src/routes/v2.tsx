import { createSignal, createMemo, onMount, For, Show } from "solid-js";
import { useAuth } from "~/lib/auth";
import { useUserCache } from "~/hooks/useUserCache";
import ExploreProfileCard from "~/components/ExploreProfileCard";
import MobileBottomNav from "~/components/v2/MobileBottomNav";
import { IoSearchOutline, IoNotificationsOutline, IoTrendingUpOutline } from "solid-icons/io";
import { A } from "@solidjs/router";

export default function HomepageV2() {
    const { user } = useAuth();
    const userCache = useUserCache(() => user()?.uid);
    const [shuffledUsers, setShuffledUsers] = createSignal<any[]>([]);

    // Shuffling Logic for 2025 "Freshness"
    createMemo(() => {
        const users = userCache.users();
        if (users.length > 0) {
            const shuffled = [...users].sort(() => Math.random() - 0.5);
            setShuffledUsers(shuffled);
        }
    });

    const onlineUsers = createMemo(() =>
        userCache.users().filter(u => u.isOnline).slice(0, 15)
    );

    return (
        <main class="min-h-screen bg-white dark:bg-black text-black dark:text-white pb-32 safe-area-bottom">
            {/* 2025 Header */}
            <header class="sticky top-0 z-[100] bg-white/70 dark:bg-black/70 backdrop-blur-3xl px-6 py-5 flex items-center justify-between border-b border-gray-100 dark:border-zinc-900 transition-all duration-500">
                <div class="flex flex-col">
                    <h1 class="text-2xl font-black tracking-tight bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent">
                        Discover
                    </h1>
                    <span class="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Curated for you</span>
                </div>
                <div class="flex items-center gap-4">
                    <button class="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-500 hover:text-pink-500 transition-colors">
                        <IoSearchOutline size={20} />
                    </button>
                    <A href="/notifications" class="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-500 hover:text-pink-500 transition-colors relative">
                        <IoNotificationsOutline size={20} />
                        <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-white dark:border-black animate-pulse" />
                    </A>
                </div>
            </header>

            {/* Story Style "Live Now" Section */}
            <section class="mt-6">
                <div class="px-6 flex items-center justify-between mb-4">
                    <h2 class="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <IoTrendingUpOutline class="text-pink-500" />
                        Live Now
                    </h2>
                    <span class="text-[10px] font-bold px-2 py-0.5 bg-pink-500/10 text-pink-500 rounded-full">
                        {onlineUsers().length} Active
                    </span>
                </div>
                <div class="flex items-center gap-4 overflow-x-auto scrollbar-hide px-6 py-2">
                    <For each={onlineUsers()}>
                        {(user) => (
                            <A href={`?profileModal=${user.user_id}`} class="flex flex-col items-center gap-2 shrink-0 group">
                                <div class="relative p-[3px] rounded-full bg-gradient-to-tr from-pink-500 via-violet-600 to-pink-500 group-active:scale-95 transition-transform duration-300 animate-gradient-shift">
                                    <div class="p-0.5 rounded-full bg-white dark:bg-black">
                                        <img
                                            src={user.photos?.[0] || '/default-avatar.png'}
                                            class="w-16 h-16 rounded-full object-cover border-2 border-transparent grayscale-[30%] group-hover:grayscale-0 transition-all"
                                            alt={user.name}
                                        />
                                    </div>
                                    <div class="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-[3px] border-white dark:border-black shadow-sm" />
                                </div>
                                <span class="text-[10px] font-bold text-gray-500 truncate w-16 text-center">{user.name}</span>
                            </A>
                        )}
                    </For>
                </div>
            </section>

            {/* Main Feed Feed */}
            <section class="mt-8 px-4 sm:px-6">
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                    <For each={shuffledUsers()}>
                        {(user) => (
                            <div class="animate-in fade-in slide-in-from-bottom-2 duration-700">
                                <ExploreProfileCard
                                    profile={user}
                                    onMessageClick={() => { }}
                                />
                            </div>
                        )}
                    </For>
                </div>
            </section>

            {/* Loading Indicator */}
            <Show when={userCache.loading()}>
                <div class="flex flex-col items-center py-12 gap-4">
                    <div class="w-8 h-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                    <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fetching Profiles</p>
                </div>
            </Show>

            {/* Bottom Navigation */}
            <MobileBottomNav />

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-shift {
                    background-size: 200% 200%;
                    animation: gradient-shift 3s ease infinite;
                }
            `}</style>
        </main>
    );
}
