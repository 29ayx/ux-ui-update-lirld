import { createSignal, Show, createMemo, onCleanup } from "solid-js";
import { useUserCache } from "~/hooks/useUserCache";
import { useUserFilters } from "~/hooks/useUserFilters";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import TabNavigation, { type TabType } from "~/components/home/TabNavigation";
import DiscoverTab from "~/components/home/DiscoverTab";
import NearbyTab from "~/components/home/NearbyTab";
import SpeedDateTab from "~/components/home/SpeedDateTab";
import OnlineTab from "~/components/home/OnlineTab";
import ExploreTab from "~/components/home/ExploreTab";
import LoadingState from "~/components/home/LoadingState";
import MarketingBanner from "~/components/MarketingBanner";
import LoginBottomSheet from "~/components/LoginBottomSheet";
import GlobalLoader from "~/components/GlobalLoader";
import MinimalUserScroll from "~/components/home/MinimalUserScroll";
import { useAuth } from "~/lib/auth";
import { Title, Meta } from "@solidjs/meta";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "~/lib/firebase";

export default function ExploreUsers() {
    const { user } = useAuth();
    const [showLoginSheet, setShowLoginSheet] = createSignal(false);
    const [activeTab, setActiveTab] = createSignal<TabType>("discover");

    // Public cache for logged-out users
    const userCache = useUserCache(() => undefined, { isPublic: true });

    const [currentUserProfile, setCurrentUserProfile] = createSignal<any>(null);

    // Sync current user profile for country-based sorting
    createMemo(() => {
        const u = user();
        if (!u) return;

        const unsubscribe = onSnapshot(doc(db, "users", u.uid), (docSnap) => {
            if (docSnap.exists()) {
                setCurrentUserProfile(docSnap.data());
            }
        });

        onCleanup(() => unsubscribe());
    });

    const currentUserCountry = createMemo(() => currentUserProfile()?.country);
    const currentUserGender = createMemo(() => currentUserProfile()?.gender);

    // Use filters (empty messaged set for public view)
    const filters = useUserFilters(() => userCache.users(), () => new Set(), currentUserCountry, currentUserGender);

    const infiniteScroll = useInfiniteScroll({
        onLoadMore: async () => {
            await userCache.loadMore();
        },
        hasMore: userCache.hasMore(),
    });

    const handleMessageSent = (userId: string) => {
        if (!user()) {
            setShowLoginSheet(true);
        }
    };

    // Filter featured users
    const featuredUsers = createMemo(() => {
        return userCache.users().filter(user => (user as any).isFeatured === true);
    });

    return (
        <Show when={!userCache.loading() || userCache.users().length > 0} fallback={<GlobalLoader />}>
            <main class="min-h-screen bg-green-200/20 dark:bg-[#09090b] relative overflow-hidden pb-32 transition-colors duration-500 text-gray-900 dark:text-zinc-100">
                <Title>Explore People - Lirld</Title>
                <Meta name="description" content="Explore new profiles and discover interesting people on Lirld. Connect with users from all over the world." />

                {/* Subtle Background Elements */}
                <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-200/20 dark:bg-zinc-800/20 blur-[120px]" />
                    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-200/20 dark:bg-zinc-800/20 blur-[120px]" />
                </div>

                <div class="max-w-9xl mx-auto">
                    <TabNavigation activeTab={activeTab()} onTabChange={setActiveTab} />

                    <div class="overflow-x-auto scrollbar-hide px-2 sm:px-2 lg:px-8">
                        <div class="flex items-stretch gap-4" style="width: max-content;">

                            <div class="w-[300px] sm:w-[500px] shrink-0 flex">
                                <MarketingBanner type="banner_home" />
                            </div>
                            <div class="w-[300px] sm:w-[500px] shrink-0 flex">
                                <MarketingBanner type="banner_promotion" />
                            </div>
                        </div>
                    </div>

                    <div class="px-4 sm:px-6 lg:px-8 py-4">
                        <Show when={userCache.users().length > 0}>
                            <Show when={featuredUsers().length > 0}>
                                <MinimalUserScroll
                                    title="Most Responsive"
                                    users={featuredUsers()}
                                />
                            </Show>
                            <Show when={activeTab() === "discover"}>
                                <DiscoverTab
                                    vipUsers={filters.vipUsers()}
                                    onlineUsers={filters.onlineUsers()}
                                    recentUsers={filters.recentUsers()}
                                    recommendedUsers={filters.recommendedUsers()}
                                    availableUsers={filters.availableUsers()}
                                    onMessageSent={handleMessageSent}
                                    messagedUserIds={new Set()}
                                />
                            </Show>

                            <Show when={activeTab() === "nearby"}>
                                <NearbyTab
                                    usersByCountry={filters.usersByCountry()}
                                    onMessageSent={handleMessageSent}
                                    messagedUserIds={new Set()}
                                />
                            </Show>

                            <Show when={activeTab() === "speed-date"}>
                                <SpeedDateTab
                                    onlineHosts={filters.onlineHosts()}
                                    allHostUsers={filters.allHostUsers()}
                                    onMessageSent={handleMessageSent}
                                    messagedUserIds={new Set()}
                                />
                            </Show>

                            <Show when={activeTab() === "online"}>
                                <OnlineTab
                                    onlineUsers={filters.onlineUsers()}
                                    onMessageSent={handleMessageSent}
                                    messagedUserIds={new Set()}
                                />
                            </Show>

                            <Show when={activeTab() === "explore"}>
                                <ExploreTab
                                    usersByAgeRange={filters.usersByAgeRange()}
                                    usersByGender={filters.usersByGender()}
                                    onMessageSent={handleMessageSent}
                                    messagedUserIds={new Set()}
                                />
                            </Show>

                            {/* Infinite scroll sentinel */}
                            <div ref={infiniteScroll.sentinelRef} class="h-4" />

                            {/* Loading indicator for infinite scroll */}
                            <Show when={infiniteScroll.loading()}>
                                <div class="flex justify-center items-center py-8 animate-in fade-in duration-200">
                                    <div class="flex items-center gap-2 text-slate-700 dark:text-white">
                                        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span class="text-sm">Loading more...</span>
                                    </div>
                                </div>
                            </Show>
                        </Show>
                    </div>
                </div>

                <LoginBottomSheet
                    isOpen={showLoginSheet()}
                    onClose={() => setShowLoginSheet(false)}
                />

                <style>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            </main>
        </Show>
    );
}
