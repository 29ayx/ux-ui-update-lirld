import { Show, For, createSignal, onMount, onCleanup, createMemo, createEffect } from "solid-js";
import { useAuth } from "~/lib/auth";
import { db } from "~/lib/firebase";
import { collection, query, where, onSnapshot, doc, orderBy, limit, type FirestoreError } from "firebase/firestore";
import ChatListItem from "~/components/chats/ChatListItem";
import ChatDetailPanel from "~/components/chats/ChatDetailPanel";
import ConfirmationModal from "~/components/ConfirmationModal";
import { toDate } from "~/lib/dateUtils";
import { deleteChat } from "~/lib/chat";
import type { ChatData, ChatMetadata, UserProfile } from "~/types/chat";
import PageHeader from "~/components/PageHeader";

const userPhotoCache = new Map<string, string>();

export default function Chats() {
  const { user } = useAuth();
  const [chats, setChats] = createSignal<ChatData[]>([]);
  const [otherUsers, setOtherUsers] = createSignal<Record<string, UserProfile>>({});
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [chatMetadata, setChatMetadata] = createSignal<Record<string, ChatMetadata>>({});
  const [photoVersion, setPhotoVersion] = createSignal(0);
  const [chatToDelete, setChatToDelete] = createSignal<string | null>(null);
  const [selectedChatId, setSelectedChatId] = createSignal<string | null>(null);

  const handleDelete = async () => {
    const chatId = chatToDelete();
    if (!chatId) return;
    setChatToDelete(null);
    if (selectedChatId() === chatId) setSelectedChatId(null);
    try {
      await deleteChat(chatId);
    } catch (err) {
      console.error("Error deleting chat:", err);
      setError("Failed to delete chat");
    }
  };

  const syncPhotoCache = (userId: string, photos?: unknown) => {
    const photoArray = Array.isArray(photos) ? photos : [];
    const primaryPhoto = typeof photoArray[0] === "string" ? photoArray[0] : "";
    if (userPhotoCache.get(userId) === primaryPhoto) return;
    userPhotoCache.set(userId, primaryPhoto);
    setPhotoVersion((prev) => prev + 1);
  };

  createEffect(() => {
    const users = otherUsers();
    Object.entries(users).forEach(([id, data]) => syncPhotoCache(id, data?.photos));
  });

  const currentUser = createMemo(() => user());

  const sortedChats = createMemo((): ChatData[] => {
    const chatsList = chats();
    const u = currentUser();
    if (!u || chatsList.length === 0) return [];
    return [...chatsList].sort((a, b) => {
      const aTime = toDate(a.updatedAt || a.lastMessageTime);
      const bTime = toDate(b.updatedAt || b.lastMessageTime);
      if (!aTime && !bTime) return 0;
      if (!aTime) return 1;
      if (!bTime) return -1;
      return bTime.getTime() - aTime.getTime();
    });
  });

  onMount(() => {
    const u = currentUser();
    if (!u) { setLoading(false); return; }

    const activeUserListeners = new Set<string>();
    const userUnsubscribes: Record<string, () => void> = {};
    const messageUnsubscribes: Record<string, () => void> = {};

    const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", u.uid));

    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        try {
          const chatsList: ChatData[] = [];
          const newUserIds = new Set<string>();
          const existingUsers = otherUsers();

          snapshot.forEach((chatDoc) => {
            const chatData = chatDoc.data() as Omit<ChatData, "id">;
            if (chatData.deletedBy?.includes(u.uid)) return;
            chatsList.push({ ...chatData, id: chatDoc.id });

            const otherUserId = chatData.participants.find((id) => id !== u.uid);
            if (otherUserId && !activeUserListeners.has(otherUserId)) {
              if (existingUsers[otherUserId]) {
                activeUserListeners.add(otherUserId);
                userUnsubscribes[otherUserId] = onSnapshot(
                  doc(db, "users", otherUserId),
                  (userDoc) => {
                    if (userDoc.exists()) {
                      const userData = userDoc.data() as UserProfile;
                      setOtherUsers((prev) => ({ ...prev, [otherUserId]: userData }));
                      syncPhotoCache(otherUserId, userData.photos);
                    }
                  },
                  (err: FirestoreError) => { console.error(`Error listening to user ${otherUserId}:`, err); }
                );
              } else {
                newUserIds.add(otherUserId);
              }
            }
          });

          setChats(chatsList);
          setLoading(false);

          chatsList.forEach((chat) => {
            if (messageUnsubscribes[chat.id]) {
              messageUnsubscribes[chat.id]();
              delete messageUnsubscribes[chat.id];
            }
            const messagesQuery = query(
              collection(db, "chats", chat.id, "messages"),
              orderBy("timestamp", "desc"),
              limit(100)
            );
            messageUnsubscribes[chat.id] = onSnapshot(messagesQuery, (snap) => {
              let unreadCount = 0;
              let lastSenderId = "";
              let lastMessageReadStatus = false;
              if (!snap.empty) {
                const last = snap.docs[0].data();
                lastSenderId = last.senderId || "";
                lastMessageReadStatus = Boolean(last.read);
                snap.forEach((msgDoc) => {
                  const d = msgDoc.data();
                  if (d.senderId !== u.uid && d.read !== true) unreadCount++;
                });
              }
              setChatMetadata((prev) => ({
                ...prev,
                [chat.id]: { unreadCount, lastSenderId, lastMessageRead: lastMessageReadStatus },
              }));
            });
          });

          newUserIds.forEach((userId) => {
            activeUserListeners.add(userId);
            userUnsubscribes[userId] = onSnapshot(
              doc(db, "users", userId),
              (userDoc) => {
                if (userDoc.exists()) {
                  const userData = userDoc.data() as UserProfile;
                  setOtherUsers((prev) => ({ ...prev, [userId]: userData }));
                  syncPhotoCache(userId, userData.photos);
                }
              },
              (err: FirestoreError) => { console.error(`Error listening to user ${userId}:`, err); }
            );
          });

          const currentChatIds = new Set(chatsList.map((c) => c.id));
          Object.keys(messageUnsubscribes).forEach((chatId) => {
            if (!currentChatIds.has(chatId)) {
              messageUnsubscribes[chatId]();
              delete messageUnsubscribes[chatId];
            }
          });
        } catch (err) {
          console.error("Error processing chats snapshot:", err);
          setError("Failed to load chats");
          setLoading(false);
        }
      },
      (err: FirestoreError) => {
        console.error("Error listening to chats:", err);
        setError("Failed to load chats");
        setLoading(false);
      }
    );

    onCleanup(() => {
      unsubscribe();
      Object.values(userUnsubscribes).forEach((u) => u());
      Object.values(messageUnsubscribes).forEach((u) => u());
    });
  });

  return (
    <div class="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex transition-colors duration-300 relative overflow-x-hidden">


      <main class="flex-1 w-full min-w-0 flex flex-col">

        {/* Mobile */}
        <div class="lg:hidden pb-32">
          <PageHeader title="Chats" />
          <div class="max-w-2xl mx-auto px-4 mt-4">
            <ChatList
              loading={loading()}
              error={error()}
              sortedChats={sortedChats()}
              currentUser={currentUser()}
              otherUsers={otherUsers()}
              chatMetadata={chatMetadata()}
              photoVersion={photoVersion()}
              onDelete={(id) => setChatToDelete(id)}
              selectedChatId={null}
              onSelect={() => {}}
              linkMode
            />
          </div>
        </div>

        {/* Desktop split */}
        <div class="hidden lg:flex h-screen overflow-hidden">

          {/* Chat list panel */}
          <div class="w-72 xl:w-80 shrink-0 flex flex-col bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800">
            {/* Panel header */}
            <div class="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 shrink-0 h-[57px] flex items-center">
              <h1 class="text-base font-bold text-gray-900 dark:text-white tracking-tight">Messages</h1>
            </div>

            {/* List */}
            <div class="flex-1 overflow-y-auto py-2 px-2">
              <ChatList
                loading={loading()}
                error={error()}
                sortedChats={sortedChats()}
                currentUser={currentUser()}
                otherUsers={otherUsers()}
                chatMetadata={chatMetadata()}
                photoVersion={photoVersion()}
                onDelete={(id) => setChatToDelete(id)}
                selectedChatId={selectedChatId()}
                onSelect={(id) => setSelectedChatId(id)}
                linkMode={false}
              />
            </div>
          </div>

          {/* Chat detail panel */}
          <div class="flex-1 overflow-hidden bg-gray-50 dark:bg-zinc-950">
            <Show
              when={selectedChatId()}
              fallback={<EmptyState />}
            >
              {(chatId) => <ChatDetailPanel chatId={chatId()} fullScreen={false} />}
            </Show>
          </div>
        </div>
      </main>

      <ConfirmationModal
        isOpen={!!chatToDelete()}
        title="Delete Chat"
        message="Are you sure you want to delete this chat? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setChatToDelete(null)}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div class="h-full flex flex-col items-center justify-center gap-6 px-8">
      <div class="w-20 h-20 rounded-3xl bg-[#010b80]/8 dark:bg-white/5 flex items-center justify-center">
        <svg class="w-10 h-10 text-[#010b80]/40 dark:text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      </div>
      <div class="text-center">
        <p class="text-base font-semibold text-gray-700 dark:text-zinc-300">Select a conversation</p>
        <p class="text-sm text-gray-400 dark:text-zinc-500 mt-1">Choose from your chats on the left to start messaging</p>
      </div>
    </div>
  );
}

// ── Shared chat list renderer ──────────────────────────────────────────────

interface ChatListProps {
  loading: boolean;
  error: string | null;
  sortedChats: ChatData[];
  currentUser: any;
  otherUsers: Record<string, UserProfile>;
  chatMetadata: Record<string, ChatMetadata>;
  photoVersion: number;
  onDelete: (id: string) => void;
  selectedChatId: string | null;
  onSelect: (id: string) => void;
  linkMode: boolean;
}

function ChatList(props: ChatListProps) {
  return (
    <>
      <Show when={props.error}>
        {(err) => (
          <div role="alert" aria-live="polite" class="mb-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            {err()}
          </div>
        )}
      </Show>

      <Show
        when={!props.loading}
        fallback={
          <div class="flex flex-col items-center justify-center py-16 gap-3">
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 bg-[#010b80]/40 dark:bg-white/30 rounded-full animate-bounce" style="animation-delay: 0s" />
              <div class="w-2 h-2 bg-[#010b80]/40 dark:bg-white/30 rounded-full animate-bounce" style="animation-delay: 0.15s" />
              <div class="w-2 h-2 bg-[#010b80]/40 dark:bg-white/30 rounded-full animate-bounce" style="animation-delay: 0.3s" />
            </div>
            <p class="text-xs text-gray-400 dark:text-zinc-500">Loading chats…</p>
          </div>
        }
      >
        <Show
          when={props.sortedChats.length > 0}
          fallback={
            <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div class="w-14 h-14 rounded-2xl bg-[#010b80]/8 dark:bg-white/5 flex items-center justify-center">
                <svg class="w-7 h-7 text-[#010b80]/30 dark:text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-700 dark:text-zinc-300">No conversations yet</p>
                <p class="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">Start chatting with someone</p>
              </div>
            </div>
          }
        >
          <ul class="space-y-0.5" role="list">
            <For each={props.sortedChats}>
              {(chat) => {
                const currentUserId = props.currentUser?.uid;
                const otherUserId = chat.participants.find((id) => id !== currentUserId) || "";

                const imageUrl = createMemo(() => {
                  props.photoVersion;
                  return userPhotoCache.get(otherUserId) || "";
                });

                const hasImage = createMemo(() => {
                  props.photoVersion;
                  return Boolean(userPhotoCache.get(otherUserId));
                });

                const otherUserName = createMemo(() =>
                  props.otherUsers[otherUserId]?.name || "Unknown User"
                );

                const metadata = createMemo(() => props.chatMetadata[chat.id] || {
                  unreadCount: 0,
                  lastSenderId: "",
                  lastMessageRead: false,
                });

                const isSelected = createMemo(() => props.selectedChatId === chat.id);

                return (
                  <ChatListItem
                    chat={chat}
                    currentUserId={currentUserId || ""}
                    otherUserId={otherUserId}
                    otherUserName={otherUserName()}
                    imageUrl={imageUrl()}
                    hasImage={hasImage()}
                    metadata={metadata()}
                    onDelete={() => props.onDelete(chat.id)}
                    onSelect={props.linkMode ? undefined : () => props.onSelect(chat.id)}
                    isSelected={isSelected()}
                  />
                );
              }}
            </For>
          </ul>
        </Show>
      </Show>
    </>
  );
}
