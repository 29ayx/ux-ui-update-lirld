import { createSignal, Show, createMemo, onCleanup } from "solid-js";
import { useAuth } from "~/lib/auth";
import { useUserCache } from "~/hooks/useUserCache";
import { useUserFilters } from "~/hooks/useUserFilters";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import { useChattedUsers } from "~/hooks/useChattedUsers";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "~/lib/firebase";
import TabNavigation, { type TabType } from "~/components/home/TabNavigation";
import DiscoverTab from "~/components/home/DiscoverTab";
import NearbyTab from "~/components/home/NearbyTab";
import SpeedDateTab from "~/components/home/SpeedDateTab";
import OnlineTab from "~/components/home/OnlineTab";
import ExploreTab from "~/components/home/ExploreTab";
import LoadingState from "~/components/home/LoadingState";
import PullToRefresh from "~/components/home/PullToRefresh";
import MarketingBanner from "~/components/MarketingBanner";
import { IoSearchOutline, IoNotificationsOutline } from "solid-icons/io";
import { A } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import SpeedDateBanner from "~/components/home/SpeedDateBanner";
import MinimalUserScroll from "~/components/home/MinimalUserScroll";
import PageHeader from "~/components/PageHeader";

export default function Home() {
  const { user } = useAuth();
  const [messagedUserIds, setMessagedUserIds] = createSignal<Set<string>>(new Set());
  const [activeTab, setActiveTab] = createSignal<TabType>("discover");

  const userCache = useUserCache(() => user()?.uid);
  const { chattedUserIds } = useChattedUsers(user()?.uid);
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

  // Stop excluding chatted users so they remain visible with an "Open Chat" button.
  const allExcludedUserIds = () => {
    return new Set<string>();
  };

  const filters = useUserFilters(() => userCache.users(), allExcludedUserIds, currentUserCountry, currentUserGender);

  const infiniteScroll = useInfiniteScroll({
    onLoadMore: async () => {
      await userCache.loadMore();
    },
    hasMore: userCache.hasMore(),
  });

  const handleMessageSent = (userId: string) => {
    setMessagedUserIds(prev => new Set([...prev, userId]));
  };

  const allMessagedIds = createMemo(() => {
    return new Set([...messagedUserIds(), ...chattedUserIds()]);
  });

  // Filter featured users
  const featuredUsers = createMemo(() => {
    return userCache.users().filter(user => (user as any).isFeatured === true);
  });

  return (
    <div class="min-h-screen bg-[#F0F3FF] dark:bg-black text-gray-900 dark:text-zinc-100 flex transition-colors duration-500 relative overflow-x-hidden">
      <Title>Lirld - Discover & Connect</Title>
      <Meta name="description" content="Discover interesting people and start meaningful conversations on Lirld." />

      {/* Subtle Background Elements placed globally */}
      <div class="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-200/20 dark:bg-zinc-800/20 blur-[120px]" />
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-200/20 dark:bg-zinc-800/20 blur-[120px]" />
      </div>



      {/* Main Content Area */}
      <main class="flex-1 w-full min-w-0 pb-32 lg:pb-12 z-10 relative">
        <PageHeader title="Discover" />

        <div class="w-full mx-auto lg:pt-6 pt-0">

          <div class="overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 lg:overflow-visible">
            <div class="flex items-stretch gap-2 sm:gap-2 lg:grid lg:grid-cols-2 lg:w-full">
              <div class="w-[90%] lg:w-full shrink-0 flex lg:min-w-0">
                <MarketingBanner type="banner_promotion" />
              </div>
              <div class="w-[90%] lg:w-full shrink-0 flex lg:min-w-0">
                <MarketingBanner type="banner_home" />
              </div>
            </div>
          </div>

          <div class="px-4 sm:px-6 lg:px-8 py-4">
            <Show when={userCache.users().length > 0} fallback={<Show when={userCache.loading()}><LoadingState /></Show>}>
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
                  messagedUserIds={allMessagedIds()}
                />
              </Show>

              <Show when={activeTab() === "nearby"}>
                <NearbyTab
                  usersByCountry={filters.usersByCountry()}
                  onMessageSent={handleMessageSent}
                  messagedUserIds={allMessagedIds()}
                />
              </Show>

              <Show when={activeTab() === "speed-date"}>
                <SpeedDateTab
                  onlineHosts={filters.onlineHosts()}
                  allHostUsers={filters.allHostUsers()}
                  onMessageSent={handleMessageSent}
                  messagedUserIds={allMessagedIds()}
                />
              </Show>

              <Show when={activeTab() === "online"}>
                <OnlineTab
                  onlineUsers={filters.onlineUsers()}
                  onMessageSent={handleMessageSent}
                  messagedUserIds={allMessagedIds()}
                />
              </Show>

              <Show when={activeTab() === "explore"}>
                <ExploreTab
                  usersByAgeRange={filters.usersByAgeRange()}
                  usersByGender={filters.usersByGender()}
                  onMessageSent={handleMessageSent}
                  messagedUserIds={allMessagedIds()}
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
      </main>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
