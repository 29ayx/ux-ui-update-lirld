import {
  For,
  Show,
  createSignal,
  onMount,
  onCleanup,
  createEffect,
  createMemo,
} from "solid-js";
import { useLocation, A, useNavigate } from "@solidjs/router";
import { useAuth } from "~/lib/auth";
import { db } from "~/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { OcNorthstar3, OcPerson2 } from "solid-icons/oc";
import { FaSolidBell, FaSolidCoins } from "solid-icons/fa";
import { BsChatDots } from "solid-icons/bs";
import { HiSolidPhone } from "solid-icons/hi";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import DynamicIsland from "./DynamicIsland";
import { openProfile } from "~/lib/profileStore";

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [totalUnreadCount, setTotalUnreadCount] = createSignal(0);
  const [chatUnreadCounts, setChatUnreadCounts] = createSignal<
    Record<string, number>
  >({});
  const [notificationUnreadCount, setNotificationUnreadCount] = createSignal(0);
  const [lastNotificationReadAt, setLastNotificationReadAt] = createSignal(0);
  const [balance, setBalance] = createSignal<number | null>(null);

  // Dynamic Island State
  const [latestMessage, setLatestMessage] = createSignal<{
    text: string;
    senderName: string;
    senderPhoto: string;
    chatId?: string;
    viewerId?: string; // For profile views
  } | null>(null);
  const [isIslandVisible, setIsIslandVisible] = createSignal(false);
  let islandTimeout: number;

  const haptic = useHapticFeedback();

  // Touch gesture states
  const [isTouching, setIsTouching] = createSignal(false);
  const [touchY, setTouchY] = createSignal(0);
  const [hoveredIndex, setHoveredIndex] = createSignal<number | null>(null);
  // Navigation items
  const navItems = createMemo(() => {
    const items = [
      { path: "/chats", icon: BsChatDots, label: "Chats", index: 0 },
      { path: "/", icon: OcNorthstar3, label: "Home", index: 1 },
      // { path: "/vault", icon: FaSolidCoins, label: "Vault", index: 2 },
      {
        path: "/notifications",
        icon: FaSolidBell,
        label: "Notification",
        index: 3,
      },
      { path: "/call-logs", icon: HiSolidPhone, label: "Calls", index: 4 },
      { path: "/profile", icon: OcPerson2, label: "Profile", index: 5 },
    ];

    return items;
  });

  const isActive = (path: string) => location.pathname === path;
  const isHomePage = () => location.pathname === "/call-logs";

  const handleChatIconTap = () => {
    haptic.trigger(50);
  };

  const handleIslandClick = () => {
    const msg = latestMessage();
    if (msg?.chatId) {
      haptic.trigger(30);
      navigate(`/chats/${msg.chatId}`);
      setIsIslandVisible(false);
      if (islandTimeout) clearTimeout(islandTimeout);
    } else if (msg?.viewerId) {
      // Navigate to viewer's profile
      haptic.trigger(30);
      openProfile(msg.viewerId);
      setIsIslandVisible(false);
      if (islandTimeout) clearTimeout(islandTimeout);
    }
  };

  // Check if we're on a public profile page (for styling)
  const isPublicProfile = createMemo(() => {
    const path = location.pathname;
    return (
      path.startsWith("/profile/") &&
      path !== "/profile" &&
      path !== "/profile/edit"
    );
  });

  const viewedUserId = createMemo(() => {
    if (isPublicProfile()) {
      const path = location.pathname;
      const match = path.match(/^\/profile\/([^\/]+)$/);
      return match ? match[1] : null;
    }
    return null;
  });


  // Calculate total unread count from per-chat counts
  createEffect(() => {
    const counts = chatUnreadCounts();
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    setTotalUnreadCount(total);
  });

  onMount(() => {
    const currentUser = user();
    if (!currentUser) return;

    const messageUnsubscribes: Record<string, () => void> = {};

    // Listen to user's chats
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid)
    );

    const chatsUnsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      // Clean up old message listeners for chats that no longer exist
      const currentChatIds = new Set<string>();

      snapshot.forEach((chatDoc) => {
        const chatData = chatDoc.data();
        const chatId = chatDoc.id;
        currentChatIds.add(chatId);

        // Only set up listener if we don't have one already
        if (!messageUnsubscribes[chatId]) {
          // Set up message listener for this chat
          const messagesQuery = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("timestamp", "desc"),
            limit(100)
          );

          const messagesUnsubscribe = onSnapshot(
            messagesQuery,
            async (messagesSnapshot) => {
              let chatUnreadCount = 0;

              // Calculate unread count
              messagesSnapshot.forEach((msgDoc) => {
                const msgData = msgDoc.data();
                if (
                  msgData.senderId !== currentUser.uid &&
                  msgData.read !== true
                ) {
                  chatUnreadCount++;
                }
              });

              // Check for new incoming messages
              messagesSnapshot.docChanges().forEach(async (change) => {
                if (change.type === "added") {
                  const msgData = change.doc.data();
                  // Only notify if it's a new message (not initial load), unread, and from someone else
                  // We check if the timestamp is recent (within last 10 seconds) to avoid notifying on old messages during initial load
                  const isRecent = msgData.timestamp?.toMillis
                    ? Date.now() - msgData.timestamp.toMillis() < 10000
                    : true;

                  if (
                    msgData.senderId !== currentUser.uid &&
                    msgData.read !== true &&
                    isRecent
                  ) {
                    try {
                      // Fetch sender details
                      const userDoc = await getDoc(
                        doc(db, "users", msgData.senderId)
                      );
                      if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const senderName =
                          userData.name || userData.Name || "Unknown";
                        const senderPhoto =
                          (userData.photos && userData.photos[0]) ||
                          userData.imageUrl ||
                          userData.photoURL ||
                          "";

                        setLatestMessage({
                          text: msgData.text || "Sent a photo",
                          senderName,
                          senderPhoto,
                          chatId,
                        });

                        setIsIslandVisible(true);

                        // Clear existing timeout
                        if (islandTimeout) clearTimeout(islandTimeout);

                        // Hide after 5 seconds
                        islandTimeout = window.setTimeout(() => {
                          setIsIslandVisible(false);
                        }, 5000);
                      }
                    } catch (error) {
                      console.error("Error fetching sender details:", error);
                    }
                  }
                }
              });

              // Update per-chat unread count
              setChatUnreadCounts((prev) => ({
                ...prev,
                [chatId]: chatUnreadCount,
              }));
            }
          );

          messageUnsubscribes[chatId] = messagesUnsubscribe;
        }
      });

      // Clean up listeners for chats that no longer exist
      Object.keys(messageUnsubscribes).forEach((chatId) => {
        if (!currentChatIds.has(chatId)) {
          messageUnsubscribes[chatId]();
          delete messageUnsubscribes[chatId];
          setChatUnreadCounts((prev) => {
            const updated = { ...prev };
            delete updated[chatId];
            return updated;
          });
        }
      });
    });

    const [recentViewers, setRecentViewers] = createSignal<any[]>([]);

    // Calculate notification unread count
    createEffect(() => {
      const viewers = recentViewers();
      const lastRead = lastNotificationReadAt();
      let unreadCount = 0;

      viewers.forEach((viewData) => {
        const viewedAt = viewData.lastViewedAt?.toMillis?.() || 0;
        if (viewedAt > lastRead) {
          unreadCount++;
        }
      });

      setNotificationUnreadCount(unreadCount);
    });

    // Listen for profile views
    const viewersQuery = query(
      collection(db, `profileViews/${currentUser.uid}/viewers`),
      orderBy("lastViewedAt", "desc"),
      limit(20)
    );

    const viewersUnsubscribe = onSnapshot(viewersQuery, (snapshot) => {
      const viewersList: any[] = [];
      snapshot.forEach((doc) => {
        viewersList.push(doc.data());
      });
      setRecentViewers(viewersList);

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const viewData = change.doc.data();
          // Only notify for very recent views (within last 10 seconds)
          const isRecent = viewData.lastViewedAt?.toMillis
            ? Date.now() - viewData.lastViewedAt.toMillis() < 10000
            : false;

          if (isRecent) {
            setLatestMessage({
              text: "viewed your profile",
              senderName: viewData.viewerName || "Someone",
              senderPhoto: viewData.viewerPhoto || "",
              viewerId: viewData.viewerId,
            });

            setIsIslandVisible(true);

            // Clear existing timeout
            if (islandTimeout) clearTimeout(islandTimeout);

            // Hide after 5 seconds
            islandTimeout = window.setTimeout(() => {
              setIsIslandVisible(false);
            }, 5000);
          }
        }
      });
    });

    // Load balance and last read timestamp
    const currentUserRef = doc(db, "users", currentUser.uid);
    const currentUserUnsubscribe = onSnapshot(currentUserRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();

        // Update last read timestamp
        const lastRead = data.lastNotificationReadAt?.toMillis?.() || 0;
        setLastNotificationReadAt(lastRead);

        // Update balance
        setBalance(data.credits ?? 0);
      }
    });

    onCleanup(() => {
      chatsUnsubscribe();
      viewersUnsubscribe();
      currentUserUnsubscribe();
      Object.values(messageUnsubscribes).forEach((unsub) => unsub());
      if (islandTimeout) clearTimeout(islandTimeout);
    });
  });


  return (
    <Show when={user()}>
      {/* change nav bar width */}
      <nav class="fixed right-0 top-0 bottom-0 z-50 w-12 md:w-16 bg-white dark:bg-black backdrop-blur-xl border-l border-black/20 dark:border-white/20 shadow-lg">
        <div class="h-full flex flex-col items-center justify-between py-4 px-1 md:px-2">
          {/* Top Section - Balance only on Homepage */}
          <div class="flex flex-col items-center gap-2">
            <Show when={isHomePage()}>
              {/* Balance Display on Homepage - Minimal & Beautiful */}

              <div class="flex flex-col items-center justify-center gap-1.5 py-4 px-2">
                {/* Coin Icon with subtle glow */}
                <div class="relative">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-md shadow-amber-500/40">
                    <FaSolidCoins class="w-5 h-5 text-white drop-shadow" />
                  </div>
                  {/* Optional soft glow ring */}
                  <div class="absolute inset-0 rounded-full bg-amber-400/20 blur-lg scale-125 -z-10" />
                </div>

                {/* Credits Amount + Label */}
                <div class="flex flex-col items-center">
                  <span class="text-xs font-bold text-slate-900 dark:text-white leading-none">
                    {balance() !== null ? balance()!.toFixed(2) : "0.00"}
                  </span>
                  <span class="text-[9px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider opacity-90">
                    Credits
                  </span>
                </div>
              </div>
            </Show>
          </div>

          {/* Dynamic Island - Shows contextual info with smooth animations */}
          <DynamicIsland
            message={latestMessage()}
            isVisible={isIslandVisible()}
            onClick={handleIslandClick}
          />

          {/* Navigation Buttons at Bottom with Touch Gesture */}
          <div
            class="relative"
            onTouchStart={(e) => {
              setIsTouching(true);
              const touch = e.touches[0];
              setTouchY(touch.clientY);
              haptic.trigger(20);
            }}
            onTouchMove={(e) => {
              if (!isTouching()) return;
              const touch = e.touches[0];
              setTouchY(touch.clientY);

              // Calculate which item is being hovered
              const navContainer = e.currentTarget.querySelector("ul");
              if (navContainer) {
                const rect = navContainer.getBoundingClientRect();
                const relativeY = touch.clientY - rect.top;
                const items = navItems();
                const itemHeight = rect.height / items.length;
                const index = Math.floor(relativeY / itemHeight);

                if (
                  index >= 0 &&
                  index < items.length &&
                  index !== hoveredIndex()
                ) {
                  setHoveredIndex(index);
                  haptic.trigger(15);
                }
              }
            }}
            onTouchEnd={(e) => {
              if (hoveredIndex() !== null) {
                const item = navItems()[hoveredIndex()!];
                navigate(item.path);
                haptic.trigger(30);
              }
              setIsTouching(false);
              setHoveredIndex(null);
            }}
            onTouchCancel={() => {
              setIsTouching(false);
              setHoveredIndex(null);
            }}
          >
            {/* Glass selection indicator */}
            <Show when={isTouching() && hoveredIndex() !== null}>
              <div
                class="absolute left-0 right-0 bg-black/30 dark:bg-white/30 backdrop-blur-lg rounded-xl border border-black/40 dark:border-white/40 shadow-2xl transition-all duration-150 ease-out pointer-events-none"
                style={{
                  top: `${hoveredIndex()! * 50 + 12}px`,
                  height: "60px",
                  transform: "scale(1.02)",
                }}
              />
            </Show>

            <ul class="flex flex-col items-center gap-2 px-2 py-3 relative z-10">
              <For each={navItems()}>
                {(item) => (
                  <li>
                    <A
                      href={item.path}
                      onClick={(e) => {
                        if (item.path === "/chats") handleChatIconTap();
                        if (isTouching()) e.preventDefault();
                      }}
                      class={`flex h-10 w-10 md:h-15 md:w-15 flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 relative ${isActive(item.path)
                        ? "bg-black/20 dark:bg-white/20 text-gray-900 dark:text-white"
                        : hoveredIndex() === item.index && isTouching()
                          ? "text-gray-900 dark:text-white scale-110"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                        }`}
                      style={{
                        transform:
                          hoveredIndex() === item.index && isTouching()
                            ? "scale(1.1)"
                            : "scale(1)",
                        transition: "transform 0.15s ease-out",
                      }}
                    >
                      <span class="text-lg md:text-xl relative">
                        <item.icon />
                        <Show
                          when={
                            item.path === "/chats" && totalUnreadCount() > 0
                          }
                        >
                          <span class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 badge-pulse">
                            {totalUnreadCount() > 9 ? "9+" : totalUnreadCount()}
                          </span>
                        </Show>
                        <Show
                          when={
                            item.path === "/notifications" &&
                            notificationUnreadCount() > 0
                          }
                        >
                          <span class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 badge-pulse">
                            {notificationUnreadCount() > 9
                              ? "9+"
                              : notificationUnreadCount()}
                          </span>
                        </Show>
                      </span>
                    </A>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </nav>
    </Show >
  );
}
