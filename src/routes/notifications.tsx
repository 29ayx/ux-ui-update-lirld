import { Component, createSignal, Show, For, onMount, createMemo, createEffect, onCleanup } from "solid-js";
import { A } from "@solidjs/router";
import { HiSolidChevronLeft } from 'solid-icons/hi';
import { FaSolidEye } from 'solid-icons/fa';
import { ImCompass } from 'solid-icons/im';
import { useAuth } from "~/lib/auth";
import { useProfileViewers } from "~/hooks/useProfileViewers";
import { useViewedAccounts } from "~/hooks/useViewedAccounts";
import { formatDistanceToNow } from "~/lib/utils/timeUtils";
import MarketingBanner from "~/components/MarketingBanner";
import { doc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "~/lib/firebase";
import PageHeader from "~/components/PageHeader";
import { openProfile } from "~/lib/profileStore";

const Notifications: Component = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = createSignal<"all" | "viewers" | "viewed">("all");
    const { viewers, loading: viewersLoading } = useProfileViewers(() => user()?.uid);
    const { viewedAccounts, loading: viewedLoading } = useViewedAccounts(() => user()?.uid);
    const [lastReadTime, setLastReadTime] = createSignal(0);

    // Listen to user's lastNotificationReadAt
    onMount(() => {
        const currentUser = user();
        if (!currentUser) {
            console.log("[Notifications] No user authenticated");
            return;
        }

        console.log("[Notifications] Component mounted for user:", currentUser.uid);

        const userRef = doc(db, "users", currentUser.uid);
        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const lastRead = data.lastNotificationReadAt?.toMillis?.() || 0;
                console.log("[Notifications] lastNotificationReadAt:", new Date(lastRead).toLocaleString());
                setLastReadTime(lastRead);
            }
        });

        onCleanup(() => unsubscribe());
    });

    createEffect(() => {
        console.log(`[Notifications] Viewers loaded: ${viewers().length}, Viewed accounts loaded: ${viewedAccounts().length}`);
        if (viewers().length > 0) {
            console.log("[Notifications] First viewer:", viewers()[0]);
        }
    });

    // Mark as read when switching to viewers tab
    createEffect(async () => {
        if (activeTab() === "viewers") {
            const currentUser = user();
            if (currentUser) {
                try {
                    const userRef = doc(db, "users", currentUser.uid);
                    await updateDoc(userRef, {
                        lastNotificationReadAt: serverTimestamp()
                    });
                } catch (error) {
                    console.error("Error marking notifications as read:", error);
                }
            }
        }
    });

    const unreadViewersCount = createMemo(() => {
        if (viewersLoading()) return 0;
        const lastRead = lastReadTime();
        return viewers().filter(v => (v.lastViewedAt || 0) > lastRead).length;
    });

    return (
        <div class="min-h-screen bg-[#F0F4F8] dark:bg-black flex transition-colors duration-300 relative overflow-x-hidden">

            
            {/* Main Content Area */}
            <main class="flex-1 w-full min-w-0 pb-32 lg:pb-12 z-10 relative">
                <PageHeader title="Notifications" />

                {/* Tabs */}
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab("all")}
                            class={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border ${activeTab() === "all"
                                ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-md"
                                : "bg-gray-100/50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-400 border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800"
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveTab("viewers")}
                            class={`relative px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border ${activeTab() === "viewers"
                                ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20"
                                : "bg-gray-100/50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-400 border-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600"
                                }`}
                        >
                            <span class="flex items-center gap-2">
                                Views
                                <Show when={unreadViewersCount() > 0}>
                                    <span class="bg-white text-purple-600 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                                        {unreadViewersCount() > 9 ? "!" : unreadViewersCount()}
                                    </span>
                                </Show>
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("viewed")}
                            class={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border ${activeTab() === "viewed"
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                : "bg-gray-100/50 dark:bg-zinc-900/50 text-slate-600 dark:text-slate-400 border-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600"
                                }`}
                        >
                            Activity
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-4">
                <Show when={activeTab() === "all"}>

                    <div class="flex items-stretch gap-4 overflow-x-auto scrollbar-hide py-2" style="width: 100%;">
                        <div class="w-[300px] sm:w-[500px] shrink-0 flex">
                            <MarketingBanner type="banner_promotion" />
                        </div>

                    </div>

                    <Show when={viewersLoading() || viewedLoading()}>
                        <div class="flex flex-col items-center justify-center py-16 space-y-3">
                            <div class="w-8 h-8 border-2 border-slate-200 dark:border-slate-800 rounded-full border-t-purple-600 animate-spin" />
                        </div>
                    </Show>

                    <Show when={!viewersLoading() && !viewedLoading()}>
                        <For each={[
                            ...viewers().map(v => ({ ...v, type: 'viewer' as const })),
                            ...viewedAccounts().map(v => ({ ...v, type: 'viewed' as const }))
                        ].sort((a, b) => (b.lastViewedAt || 0) - (a.lastViewedAt || 0))}>
                            {(item) => (
                                <div
                                    onClick={() => openProfile(item.type === 'viewer' ? item.viewerId : item.viewedUserId)}
                                    class="cursor-pointer group block bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                                >
                                    <div class="flex items-center gap-4">
                                        <div class="relative shrink-0">
                                            <Show
                                                when={item.type === 'viewer' ? item.viewerPhoto : item.viewedUserPhoto}
                                                fallback={
                                                    <div class={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm ${item.type === 'viewer'
                                                        ? 'bg-gradient-to-br from-purple-500 to-fuchsia-600'
                                                        : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                                                        }`}>
                                                        {(item.type === 'viewer' ? item.viewerName : item.viewedUserName).charAt(0).toUpperCase()}
                                                    </div>
                                                }
                                            >
                                                <img
                                                    src={item.type === 'viewer' ? item.viewerPhoto : item.viewedUserPhoto}
                                                    alt={item.type === 'viewer' ? item.viewerName : item.viewedUserName}
                                                    class="w-14 h-14 rounded-2xl object-cover shadow-sm"
                                                />
                                            </Show>
                                            <div class={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-md border-2 border-white dark:border-slate-900 ${item.type === 'viewer' ? 'bg-purple-600' : 'bg-blue-600'
                                                }`}>
                                                {item.type === 'viewer' ? <FaSolidEye size={10} /> : <ImCompass size={10} />}
                                            </div>
                                        </div>

                                        <div class="flex-1 min-w-0">
                                            <div class="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 class="text-base font-bold text-slate-900 dark:text-white truncate tracking-tight">
                                                    {item.type === 'viewer' ? item.viewerName : item.viewedUserName}
                                                </h3>
                                                <span class={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${item.type === 'viewer'
                                                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800'
                                                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800'
                                                    }`}>
                                                    {item.type === 'viewer' ? 'Viewed You' : 'You Viewed'}
                                                </span>
                                            </div>
                                            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 leading-snug">
                                                {item.type === 'viewer'
                                                    ? `Viewed You ${item.viewCount} time${item.viewCount > 1 ? "s" : ""}`
                                                    : `You viewed this profile ${item.viewCount} time${item.viewCount > 1 ? "s" : ""}`
                                                }
                                            </p>
                                            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 uppercase tracking-wide">
                                                {formatDistanceToNow(item.lastViewedAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </For>

                        <Show when={viewers().length === 0 && viewedAccounts().length === 0}>
                            <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
                                <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                                    <ImCompass size={24} />
                                </div>
                                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No Activity</h3>
                                <p class="text-sm text-slate-500 dark:text-slate-400">No signals detected yet.</p>
                            </div>
                        </Show>
                    </Show>
                </Show>

                <Show when={activeTab() === "viewers"}>
                    <Show when={viewersLoading()}>
                        <div class="flex flex-col items-center justify-center py-16 space-y-3">
                            <div class="w-8 h-8 border-2 border-slate-200 dark:border-slate-800 rounded-full border-t-purple-600 animate-spin" />
                        </div>
                    </Show>

                    <Show when={!viewersLoading() && viewers().length === 0}>
                        <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <div class="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-4 text-purple-200 dark:text-purple-700">
                                <FaSolidEye size={24} />
                            </div>
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No Observers</h3>
                            <p class="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Your profile hasn't been viewed yet.</p>
                        </div>
                    </Show>

                    <For each={viewers()}>
                        {(viewer) => (
                            <div
                                onClick={() => openProfile(viewer.viewerId)}
                                class="cursor-pointer group block bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                            >
                                <div class="flex items-center gap-4">
                                    <Show
                                        when={viewer.viewerPhoto}
                                        fallback={
                                            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0">
                                                {viewer.viewerName.charAt(0).toUpperCase()}
                                            </div>
                                        }
                                    >
                                        <img
                                            src={viewer.viewerPhoto}
                                            alt={viewer.viewerName}
                                            class="w-14 h-14 rounded-2xl object-cover shadow-sm shrink-0"
                                        />
                                    </Show>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center justify-between mb-1">
                                            <h3 class="text-base font-bold text-slate-900 dark:text-white truncate tracking-tight">
                                                {viewer.viewerName}
                                            </h3>
                                            <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                                {formatDistanceToNow(viewer.lastViewedAt)}
                                            </span>
                                        </div>
                                        <p class="text-xs font-bold text-purple-600 dark:text-purple-400">
                                            Viewed you {viewer.viewCount > 1 ? "times" : "time"} {viewer.viewCount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </For>
                </Show>

                <Show when={activeTab() === "viewed"}>
                    <Show when={viewedLoading()}>
                        <div class="flex flex-col items-center justify-center py-16 space-y-3">
                            <div class="w-8 h-8 border-2 border-slate-200 dark:border-slate-800 rounded-full border-t-blue-600 animate-spin" />
                        </div>
                    </Show>

                    <Show when={!viewedLoading() && viewedAccounts().length === 0}>
                        <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <div class="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4 text-blue-200 dark:text-blue-700">
                                <ImCompass size={24} />
                            </div>
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No Scans</h3>
                            <p class="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">You haven't viewed any profiles yet.</p>
                        </div>
                    </Show>

                    <For each={viewedAccounts()}>
                        {(account) => (
                            <div
                                onClick={() => openProfile(account.viewedUserId)}
                                class="cursor-pointer group block bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                            >
                                <div class="flex items-center gap-4">
                                    <Show
                                        when={account.viewedUserPhoto}
                                        fallback={
                                            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0">
                                                {account.viewedUserName.charAt(0).toUpperCase()}
                                            </div>
                                        }
                                    >
                                        <img
                                            src={account.viewedUserPhoto}
                                            alt={account.viewedUserName}
                                            class="w-14 h-14 rounded-2xl object-cover shadow-sm shrink-0"
                                        />
                                    </Show>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center justify-between mb-1">
                                            <h3 class="text-base font-bold text-slate-900 dark:text-white truncate tracking-tight">
                                                {account.viewedUserName}
                                            </h3>
                                            <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                                {formatDistanceToNow(account.lastViewedAt)}
                                            </span>
                                        </div>
                                        <p class="text-xs font-bold text-blue-600 dark:text-blue-400">
                                            You viewed this profile {account.viewCount} time{account.viewCount > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </For>
                </Show>
            </div>
        </main>
    </div>
    );
};

export default Notifications;
