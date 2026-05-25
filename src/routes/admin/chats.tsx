import { createSignal, createMemo, Show, For, onMount, onCleanup, createEffect } from "solid-js";
import AdminLayout from "~/components/admin/AdminLayout";
import { useAdminUsers, AdminUserData } from "~/lib/admin";
import { db } from "~/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc, serverTimestamp, addDoc, setDoc, collectionGroup } from "firebase/firestore";
import { toDate } from "~/lib/dateUtils";
import { markMessagesAsRead } from "~/lib/chat";
import { recordProfileView } from "~/lib/profileViews";
import { IoSearch, IoSend, IoArrowBack, IoChatbubbles, IoPerson, IoClose, IoEyeOutline, IoCall, IoTime } from "solid-icons/io";
import { useAuth } from "~/lib/auth";
import { subscribeToCallLogs, type CallLog } from '~/lib/callLogs';
import CallLogUser from "~/components/call/CallLogUser";
import { type Call } from "~/lib/calls";

interface ChatData {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  updatedAt?: any;
  otherUserId?: string;
  otherUser?: AdminUserData;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  read: boolean;
}

type ViewMode = "hosts" | "chats" | "messages";

export default function AdminChats() {
  const { user: adminUser } = useAuth();
  const { users, loading: usersLoading, searchQuery, setSearchQuery } = useAdminUsers();

  // State
  const [selectedHostId, setSelectedHostId] = createSignal<string | null>(null);
  const [selectedChatId, setSelectedChatId] = createSignal<string | null>(null);
  const [activeChats, setActiveChats] = createSignal<ChatData[]>([]);
  const [chatsLoading, setChatsLoading] = createSignal(false);
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [messageText, setMessageText] = createSignal("");
  const [sending, setSending] = createSignal(false);
  const [chatUsersCache, setChatUsersCache] = createSignal<Record<string, AdminUserData>>({});
  const [globalUnreadByChat, setGlobalUnreadByChat] = createSignal<Record<string, Message[]>>({});
  const [viewMode, setViewMode] = createSignal<ViewMode>("hosts");
  const [allChats, setAllChats] = createSignal<ChatData[]>([]); // All chats for sorting hosts
  const [allChatsLoaded, setAllChatsLoaded] = createSignal(false);
  const [unreadLoaded, setUnreadLoaded] = createSignal(false);
  const [hostViewCount, setHostViewCount] = createSignal(0);
  const [sendingView, setSendingView] = createSignal(false);
  const [isSideNavOpen, setIsSideNavOpen] = createSignal(false);
  const [hostCallLogs, setHostCallLogs] = createSignal<CallLog[]>([]);
  const [hostIncomingCalls, setHostIncomingCalls] = createSignal<Call[]>([]);

  // Computed
  const hosts = createMemo(() => users().filter(u => u.isHost === true));

  const selectedHost = createMemo(() => {
    const id = selectedHostId();
    return id ? users().find(u => u.id === id) : null;
  });

  const sortedChats = createMemo(() => {
    return [...activeChats()].sort((a, b) => {
      const aTime = toDate(a.lastMessageTime || a.updatedAt);
      const bTime = toDate(b.lastMessageTime || b.updatedAt);
      if (!aTime && !bTime) return 0;
      if (!aTime) return 1;
      if (!bTime) return -1;
      return bTime.getTime() - aTime.getTime();
    });
  });

  const currentChatUser = createMemo(() => {
    const chatId = selectedChatId();
    if (!chatId) return null;
    const chat = activeChats().find(c => c.id === chatId);
    if (!chat || !chat.otherUserId) return null;
    return chatUsersCache()[chat.otherUserId];
  });

  const hostUnreadCounts = createMemo(() => {
    const unreadByChat = globalUnreadByChat();
    const chats = allChats();
    const allHosts = hosts();
    const counts: Record<string, number> = {};

    // Initialize all hosts with 0
    allHosts.forEach(h => counts[h.id] = 0);

    // Debug logging
    console.log('Calculating unread counts:', {
      chatsLoaded: allChatsLoaded(),
      unreadLoaded: unreadLoaded(),
      totalChats: chats.length,
      totalUnreadChats: Object.keys(unreadByChat).length,
      hosts: allHosts.length
    });

    // Only calculate if we have both chats and unread data loaded
    if (!allChatsLoaded() || !unreadLoaded()) {
      console.log('Data not ready yet, returning empty counts');
      return counts;
    }

    // Count unread messages for each host
    chats.forEach(chat => {
      const msgs = unreadByChat[chat.id];
      if (!msgs || msgs.length === 0) return;

      // Find which participant is a host
      const hostId = chat.participants.find(p => allHosts.some(h => h.id === p));
      if (hostId) {
        // Count messages NOT sent by the host (messages TO the host)
        const unreadCount = msgs.filter(m => m.senderId !== hostId).length;
        if (unreadCount > 0) {
          counts[hostId] = (counts[hostId] || 0) + unreadCount;
          console.log(`Host ${hostId} has ${unreadCount} unread in chat ${chat.id}`);
        }
      }
    });

    console.log('Final unread counts:', counts);
    return counts;
  });

  // Sort hosts by most recent message time AND unread status
  const sortedHosts = createMemo(() => {
    const allHosts = hosts();
    const chats = allChats();
    const unreadCounts = hostUnreadCounts();
    const hostLastMessageTime: Record<string, number> = {};

    // Find the most recent message time for each host
    chats.forEach(chat => {
      if (!chat.lastMessageTime) return;
      const timestamp = chat.lastMessageTime?.toMillis
        ? chat.lastMessageTime.toMillis()
        : (chat.lastMessageTime?.seconds * 1000 || 0);

      chat.participants.forEach(pId => {
        if (allHosts.some(h => h.id === pId)) {
          if (!hostLastMessageTime[pId] || timestamp > hostLastMessageTime[pId]) {
            hostLastMessageTime[pId] = timestamp;
          }
        }
      });
    });

    // Sort: hosts with unread first, then by most recent message time, then by name
    return [...allHosts].sort((a, b) => {
      const unreadA = unreadCounts[a.id] || 0;
      const unreadB = unreadCounts[b.id] || 0;

      // Prioritize hosts with unread messages
      if (unreadA > 0 && unreadB === 0) return -1;
      if (unreadB > 0 && unreadA === 0) return 1;

      // Both have unread or both don't - sort by time
      const timeA = hostLastMessageTime[a.id] || 0;
      const timeB = hostLastMessageTime[b.id] || 0;

      if (timeA && timeB) {
        return timeB - timeA; // Both have messages, sort by time (newest first)
      }
      if (timeA) return -1; // A has messages, B doesn't
      if (timeB) return 1; // B has messages, A doesn't

      // Neither has messages, sort by name
      return (a.name || "").localeCompare(b.name || "");
    });
  });

  const chatUnreadCounts = createMemo(() => {
    const unreadByChat = globalUnreadByChat();
    const hostId = selectedHostId();
    const counts: Record<string, number> = {};

    if (!hostId) return {};

    activeChats().forEach(chat => {
      const msgs = unreadByChat[chat.id] || [];
      const count = msgs.filter(m => m.senderId !== hostId).length;
      counts[chat.id] = count;
    });

    return counts;
  });

  // Load ALL chats for host sorting and unread counts with real-time updates
  onMount(() => {
    console.log('Starting all chats listener...');
    const q = query(
      collection(db, "chats"),
      orderBy("lastMessageTime", "desc"),
      limit(1000)
    );

    const unsubscribe = onSnapshot(q, { includeMetadataChanges: false }, (snapshot) => {
      console.log('All chats snapshot received:', snapshot.size, 'chats');
      const chats: ChatData[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          participants: data.participants || [],
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime,
          updatedAt: data.updatedAt,
        });
      });
      console.log('Setting all chats:', chats.length);
      setAllChats(chats);
      setAllChatsLoaded(true);
    }, (error) => {
      console.error("Error loading all chats:", error);
      setAllChatsLoaded(true);
    });

    onCleanup(() => unsubscribe());
  });

  // Load unread messages for all chats (without collection group index)
  createEffect(() => {
    const chats = allChats();
    if (chats.length === 0) {
      return;
    }

    console.log('Setting up unread listeners for', chats.length, 'chats...');
    const unsubscribers: (() => void)[] = [];
    const unreadByChat: Record<string, Message[]> = {};
    let loadedCount = 0;

    // Listen to unread messages for each chat
    chats.forEach(chat => {
      const messagesQuery = query(
        collection(db, "chats", chat.id, "messages"),
        where("read", "==", false)
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          msgs.push({
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            timestamp: data.timestamp,
            read: data.read
          });
        });

        if (msgs.length > 0) {
          unreadByChat[chat.id] = msgs;
        } else {
          delete unreadByChat[chat.id];
        }

        loadedCount++;

        // Update the global state
        setGlobalUnreadByChat({ ...unreadByChat });

        // Mark as loaded after first batch
        if (loadedCount >= chats.length / 2 && !unreadLoaded()) {
          setUnreadLoaded(true);
          console.log('Unread messages loaded:', Object.keys(unreadByChat).length, 'chats with unread');
        }
      }, (error) => {
        console.error(`Error loading unread for chat ${chat.id}:`, error);
      });

      unsubscribers.push(unsubscribe);
    });

    // Cleanup all listeners
    onCleanup(() => {
      console.log('Cleaning up', unsubscribers.length, 'unread listeners');
      unsubscribers.forEach(unsub => unsub());
    });
  });

  // Fetch chats for selected host
  createEffect(() => {
    const hostId = selectedHostId();
    if (!hostId) {
      setActiveChats([]);
      return;
    }

    setChatsLoading(true);
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", hostId)
    );

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      const chatsList: ChatData[] = [];
      const userIdsToFetch = new Set<string>();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const otherId = data.participants.find((p: string) => p !== hostId);
        if (otherId) userIdsToFetch.add(otherId);

        chatsList.push({
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime,
          updatedAt: data.updatedAt,
          otherUserId: otherId
        });
      });

      // Fetch user data
      const currentCache = chatUsersCache();
      const fetchPromises = Array.from(userIdsToFetch).map(async (uid) => {
        if (!currentCache[uid]) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            return { uid, data: { id: uid, ...userDoc.data() } as AdminUserData };
          }
        }
        return null;
      });

      const newUsers = await Promise.all(fetchPromises);
      const updates: Record<string, AdminUserData> = {};
      newUsers.forEach(u => {
        if (u) updates[u.uid] = u.data;
      });

      if (Object.keys(updates).length > 0) {
        setChatUsersCache(prev => ({ ...prev, ...updates }));
      }

      setActiveChats(chatsList);
      setChatsLoading(false);
    });

    onCleanup(() => unsubscribe());
  });

  // Fetch messages for selected chat
  createEffect(() => {
    const chatId = selectedChatId();
    if (!chatId) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          timestamp: data.timestamp,
          read: data.read
        });
      });
      setMessages(msgs);

      setTimeout(() => {
        const container = document.getElementById("messages-container");
        if (container) container.scrollTop = container.scrollHeight;
      }, 100);
    });

    onCleanup(() => unsubscribe());
  });

  // Mark messages as read
  createEffect(() => {
    const msgs = messages();
    const chatId = selectedChatId();
    const hostId = selectedHostId();

    if (!chatId || !hostId || msgs.length === 0) return;

    const hasUnread = msgs.some(m => !m.read && m.senderId !== hostId);
    if (hasUnread) {
      markMessagesAsRead(chatId, hostId).catch(err => {
        console.error("Error marking messages as read:", err);
      });
    }
  });

  // Fetch host's view count for current user
  createEffect(() => {
    const hostId = selectedHostId();
    const guestUser = currentChatUser();

    if (!hostId || !guestUser?.id) {
      setHostViewCount(0);
      return;
    }

    const viewRef = doc(db, `profileViews/${guestUser.id}/viewers/${hostId}`);
    const unsubscribe = onSnapshot(viewRef, (doc) => {
      if (doc.exists()) {
        setHostViewCount(doc.data().viewCount || 0);
      } else {
        setHostViewCount(0);
      }
    });

    onCleanup(() => unsubscribe());
  });

  const handleSendView = async () => {
    const host = selectedHost();
    const guest = currentChatUser();

    if (!host || !guest || sendingView()) return;

    setSendingView(true);
    try {
      await recordProfileView(
        host.id,
        guest.id,
        host.name || "Host",
        host.photos?.[0] || ""
      );
      // The effect above will update the hostViewCount signal automatically
    } catch (error) {
      console.error("Error sending view:", error);
    } finally {
      setTimeout(() => setSendingView(false), 1000); // Debounce
    }
  };

  // Subscribe to call logs for selected host
  createEffect(() => {
    const hostId = selectedHostId();
    if (!hostId) {
      setHostCallLogs([]);
      return;
    }

    const unsubscribe = subscribeToCallLogs(
      hostId,
      (updatedLogs) => {
        setHostCallLogs(updatedLogs);
      },
      20
    );

    onCleanup(() => unsubscribe());
  });

  // Subscribe to incoming calls for selected host
  createEffect(() => {
    const hostId = selectedHostId();
    if (!hostId) {
      setHostIncomingCalls([]);
      return;
    }

    const q = query(
      collection(db, 'calls'),
      where('calleeId', '==', hostId),
      where('status', '==', 'ringing')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calls: Call[] = [];
      snapshot.forEach(doc => {
        calls.push({ id: doc.id, ...doc.data() } as Call);
      });
      setHostIncomingCalls(calls);
    });

    onCleanup(() => unsubscribe());
  });

  const handleSendMessage = async () => {
    const chatId = selectedChatId();
    const hostId = selectedHostId();
    const text = messageText().trim();

    if (!chatId || !hostId || !text || sending()) return;

    setSending(true);
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        text,
        senderId: hostId,
        timestamp: serverTimestamp(),
        read: false,
      });

      const chatRef = doc(db, "chats", chatId);
      await setDoc(chatRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedBy: []
      }, { merge: true });

      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const handleSelectHost = (hostId: string) => {
    setSelectedHostId(hostId);
    setSelectedChatId(null);
    setViewMode("chats");
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setViewMode("messages");
  };

  const handleBackToHosts = () => {
    setSelectedHostId(null);
    setSelectedChatId(null);
    setViewMode("hosts");
  };

  const handleBackToChats = () => {
    setSelectedChatId(null);
    setViewMode("chats");
  };

  return (
    <AdminLayout>
      <div class="flex flex-col gap-4 h-[calc(100vh-140px)]">
        {/* Header */}
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Show when={viewMode() !== "hosts"}>
              <button
                onClick={() => viewMode() === "messages" ? handleBackToChats() : handleBackToHosts()}
                class="lg:hidden w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <IoArrowBack size={20} />
              </button>
            </Show>
            <div>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Admin <span class="text-blue-600">Chats</span>
              </h1>
              <p class="text-xs sm:text-sm text-slate-500 font-medium">
                Manage host conversations
                <Show when={!allChatsLoaded() || !unreadLoaded()}>
                  <span class="ml-2 text-blue-600">• Loading...</span>
                </Show>
              </p>
              {/* Debug Info */}
              <div class="text-[10px] text-slate-400 mt-1 space-x-2">
                <span>Chats: {allChats().length} {allChatsLoaded() ? '✓' : '⏳'}</span>
                <span>Unread: {Object.keys(globalUnreadByChat()).length} {unreadLoaded() ? '✓' : '⏳'}</span>
                <span>Hosts: {hosts().length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div class="flex-1 flex gap-4 overflow-hidden">
          {/* Hosts Panel */}
          <div class={`${viewMode() === "hosts" ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-80 bg-white rounded-2xl border border-slate-200 overflow-hidden`}>
            <div class="p-4 border-b border-slate-200">
              <div class="relative">
                <IoSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search hosts..."
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.currentTarget.value)}
                  class="w-full pl-10 pr-4 py-2.5 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-2">
              <Show when={!usersLoading()} fallback={
                <div class="flex items-center justify-center h-full">
                  <div class="text-center">
                    <div class="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                    <p class="text-xs text-slate-500">Loading hosts...</p>
                  </div>
                </div>
              }>
                <div class="space-y-1">
                  <For each={sortedHosts()}>
                    {(host) => {
                      // Create a reactive accessor for this host's unread count
                      const unreadCount = () => hostUnreadCounts()[host.id] || 0;
                      return (
                        <button
                          onClick={() => handleSelectHost(host.id)}
                          class={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${selectedHostId() === host.id
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-slate-50 border border-transparent"
                            }`}
                        >
                          <div class="relative flex-shrink-0">
                            <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-100">
                              <Show when={host.photos?.[0]} fallback={
                                <div class="w-full h-full flex items-center justify-center text-slate-400">
                                  <IoPerson size={18} />
                                </div>
                              }>
                                <img src={host.photos![0]} alt={host.name} class="w-full h-full object-cover" />
                              </Show>
                            </div>
                            <Show when={unreadCount() > 0}>
                              <div class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                                {unreadCount() > 9 ? '9+' : unreadCount()}
                              </div>
                            </Show>
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="font-bold text-sm text-slate-900 truncate">{host.name || "Unknown"}</p>
                            <p class="text-xs text-slate-500 truncate">{host.email}</p>
                          </div>
                        </button>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </div>
          </div>

          {/* Chats Panel */}
          <div class={`${viewMode() === "chats" ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-80 bg-white rounded-2xl border border-slate-200 overflow-hidden`}>
            <div class="p-4 border-b border-slate-200">
              <Show when={selectedHost()}>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-100">
                    <Show when={selectedHost()?.photos?.[0]}>
                      <img src={selectedHost()!.photos![0]} class="w-full h-full object-cover" />
                    </Show>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm text-slate-900 truncate">{selectedHost()?.name}</p>
                    <p class="text-xs text-slate-500">Conversations</p>
                  </div>
                </div>
              </Show>
            </div>

            <div class="flex-1 overflow-y-auto p-2">
              <Show when={selectedHostId()} fallback={
                <div class="flex items-center justify-center h-full text-center p-4">
                  <div>
                    <IoChatbubbles class="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p class="text-sm text-slate-500">Select a host</p>
                  </div>
                </div>
              }>
                <Show when={!chatsLoading()} fallback={
                  <div class="flex items-center justify-center h-full">
                    <div class="text-center">
                      <div class="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                      <p class="text-xs text-slate-500">Loading chats...</p>
                    </div>
                  </div>
                }>
                  <Show when={sortedChats().length > 0} fallback={
                    <div class="flex items-center justify-center h-full text-center p-4">
                      <p class="text-sm text-slate-500">No conversations</p>
                    </div>
                  }>
                    <div class="space-y-1">
                      <For each={sortedChats()}>
                        {(chat) => {
                          const otherUser = chatUsersCache()[chat.otherUserId || ""];
                          const unread = () => chatUnreadCounts()[chat.id] || 0;
                          return (
                            <button
                              onClick={() => handleSelectChat(chat.id)}
                              class={`w-full text-left p-3 rounded-xl transition-all ${selectedChatId() === chat.id
                                ? "bg-blue-50 border border-blue-200"
                                : "hover:bg-slate-50 border border-transparent"
                                }`}
                            >
                              <div class="flex gap-3">
                                <div class="relative flex-shrink-0">
                                  <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-100">
                                    <Show when={otherUser?.photos?.[0]} fallback={
                                      <div class="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                                        {otherUser?.name?.[0] || "?"}
                                      </div>
                                    }>
                                      <img src={otherUser.photos![0]} class="w-full h-full object-cover" />
                                    </Show>
                                  </div>
                                  <Show when={unread() > 0}>
                                    <div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                                  </Show>
                                </div>
                                <div class="flex-1 min-w-0">
                                  <div class="flex justify-between items-baseline mb-0.5">
                                    <p class="font-bold text-sm text-slate-900 truncate">{otherUser?.name || "Unknown"}</p>
                                    <span class="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                                      {toDate(chat.lastMessageTime)?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                  <p class={`text-xs truncate ${unread() > 0 ? "text-slate-900 font-semibold" : "text-slate-500"}`}>
                                    {chat.lastMessage || "No messages"}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        }}
                      </For>
                    </div>
                  </Show>
                </Show>
              </Show>
            </div>
          </div>

          {/* Messages Panel */}
          <div class={`${viewMode() === "messages" ? "flex" : "hidden"} lg:flex flex-col flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden`}>
            <Show when={selectedChatId()} fallback={
              <div class="flex-1 flex items-center justify-center text-center p-4">
                <div>
                  <IoChatbubbles class="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p class="text-lg font-bold text-slate-900 mb-1">No chat selected</p>
                  <p class="text-sm text-slate-500">Select a conversation to start</p>
                </div>
              </div>
            }>
              {/* Chat Header */}
              <div class="p-4 border-b border-slate-200 flex items-center justify-between">
                <Show when={currentChatUser()}>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-100">
                      <Show when={currentChatUser()?.photos?.[0]}>
                        <img src={currentChatUser()!.photos![0]} class="w-full h-full object-cover" />
                      </Show>
                    </div>
                    <div>
                      <p class="font-bold text-sm text-slate-900">{currentChatUser()?.name}</p>
                      <p class="text-xs text-slate-500">Chatting as {selectedHost()?.name}</p>
                    </div>
                  </div>

                  {/* View Controls */}
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <IoEyeOutline class="text-slate-400" size={16} />
                      <span class="text-xs font-bold text-slate-700">{hostViewCount()}</span>
                    </div>
                    <button
                      onClick={() => setIsSideNavOpen(true)}
                      class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      <IoCall size={16} />
                      Log
                    </button>
                    <button
                      onClick={handleSendView}
                      disabled={sendingView()}
                      class={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sendingView()
                        ? "bg-slate-100 text-slate-400"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        }`}
                    >
                      <Show when={sendingView()} fallback={<IoEyeOutline size={16} />}>
                        <div class="w-3 h-3 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                      </Show>
                      {sendingView() ? "Sending..." : "Send View"}
                    </button>
                  </div>
                </Show>
              </div>

              {/* Messages */}
              <div id="messages-container" class="flex-1 overflow-y-auto p-4 space-y-3">
                <For each={messages()}>
                  {(msg) => {
                    const isHost = msg.senderId === selectedHostId();
                    return (
                      <div class={`flex ${isHost ? "justify-end" : "justify-start"}`}>
                        <div class={`max-w-[75%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl ${isHost
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-slate-100 text-slate-900 rounded-bl-none"
                          }`}>
                          <p class="text-sm leading-relaxed break-words">{msg.text}</p>
                          <p class={`text-[10px] mt-1 ${isHost ? "text-blue-100" : "text-slate-500"}`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>

              {/* Input */}
              <div class="p-4 border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  class="flex gap-2"
                >
                  <input
                    type="text"
                    value={messageText()}
                    onInput={(e) => setMessageText(e.currentTarget.value)}
                    placeholder="Type a message..."
                    class="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-black transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!messageText().trim() || sending()}
                    class="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
                  >
                    <IoSend size={18} />
                  </button>
                </form>
              </div>
            </Show>
          </div>

          {/* Call Activities Inline Panel */}
          <Show when={isSideNavOpen()}>
            <div class="hidden xl:flex flex-col w-72 bg-white rounded-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
              <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 class="font-black text-xs text-slate-900 uppercase tracking-tight">Call Activities</h2>
                <button
                  onClick={() => setIsSideNavOpen(false)}
                  class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
                >
                  <IoClose size={16} />
                </button>
              </div>

              <div class="flex-1 overflow-y-auto p-3 space-y-6">
                {/* Incoming Calls Section */}
                <div>
                  <h3 class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Live Status</h3>
                  <div class="space-y-1.5">
                    <Show when={hostIncomingCalls().length > 0} fallback={
                      <div class="px-3 py-4 text-center border-2 border-dashed border-slate-50 rounded-xl">
                        <p class="text-[10px] text-slate-400 font-bold italic">No active incoming calls</p>
                      </div>
                    }>
                      <For each={hostIncomingCalls()}>
                        {(call) => (
                          <div class="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl animate-pulse">
                            <div class="flex items-center gap-2.5 min-w-0">
                              <div class="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
                                <IoCall size={12} />
                              </div>
                              <div class="min-w-0">
                                <CallLogUser userId={call.callerId} fallbackName="Caller" />
                                <span class="text-[8px] text-emerald-600 font-black uppercase tracking-tighter">RINGING</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </For>
                    </Show>
                  </div>
                </div>

                {/* History Section */}
                <div>
                  <h3 class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">History</h3>
                  <div class="space-y-1.5">
                    <Show when={hostCallLogs().length > 0} fallback={
                      <div class="px-3 py-4 text-center border border-slate-50 rounded-xl">
                        <p class="text-[10px] text-slate-400 italic">No history</p>
                      </div>
                    }>
                      <For each={hostCallLogs()}>
                        {(log) => (
                          <div class="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                            <div class="flex items-center justify-between mb-1.5">
                              <div class={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${log.status === 'missed' ? 'bg-red-50 text-red-500' :
                                log.direction === 'incoming' ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400'
                                }`}>
                                <Show when={log.status === 'missed'} fallback={<IoCall size={10} />}>
                                  <IoClose size={10} />
                                </Show>
                              </div>
                              <span class="text-[8px] font-black text-slate-300 uppercase">
                                {log.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div class="min-w-0">
                              <CallLogUser userId={log.otherUserId} fallbackName="Participant" />
                              <div class="flex items-center gap-1.5 mt-0.5">
                                <span class={`text-[8px] font-black uppercase tracking-tighter ${log.status === 'missed' ? 'text-red-500' : 'text-slate-400'
                                  }`}>
                                  {log.direction} • {log.status}
                                </span>
                                <Show when={log.status === 'completed'}>
                                  <span class="text-[8px] text-slate-300 font-bold">• {Math.floor(log.duration / 60)}m</span>
                                </Show>
                              </div>
                            </div>
                          </div>
                        )}
                      </For>
                    </Show>
                  </div>
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </AdminLayout>
  );
}
