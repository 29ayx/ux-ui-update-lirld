import { Show, For, createSignal, onMount, onCleanup, createEffect, createMemo } from "solid-js";
import { AiFillEye } from 'solid-icons/ai';
import { HiSolidChevronLeft, HiSolidChevronDown, HiSolidPhone } from 'solid-icons/hi';
import { useAuth } from "~/lib/auth";
import { initiateCall } from "~/lib/calls";
import { checkMicrophonePermission } from "~/lib/permissions";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { A, useNavigate } from "@solidjs/router";
import BalanceErrorModal from "~/components/BalanceErrorModal";
import { db } from "~/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  where
} from "firebase/firestore";
import { sendMessage, markMessagesAsRead } from "~/lib/chat";
import OnlineIndicator from "~/components/OnlineIndicator";

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  read: boolean;
}

interface ChatDetailPanelProps {
  chatId: string;
  /** When true, renders as a full-screen fixed overlay (mobile). When false, fills its container (desktop panel). */
  fullScreen?: boolean;
  onBack?: () => void;
}

export default function ChatDetailPanel(props: ChatDetailPanelProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [messageText, setMessageText] = createSignal("");
  const [otherUser, setOtherUser] = createSignal<any>(null);
  const [otherUserId, setOtherUserId] = createSignal<string | null>(null);
  const [sending, setSending] = createSignal(false);
  const [sendingCall, setSendingCall] = createSignal(false);
  const haptic = useHapticFeedback();
  const [unauthorized, setUnauthorized] = createSignal(false);
  const [authorized, setAuthorized] = createSignal(false);
  const [showScrollButton, setShowScrollButton] = createSignal(false);
  const [isNearBottom, setIsNearBottom] = createSignal(true);
  const [previousMessageCount, setPreviousMessageCount] = createSignal(0);
  const [showBalanceError, setShowBalanceError] = createSignal(false);
  const [balanceErrorMessage, setBalanceErrorMessage] = createSignal("");
  const [callPricePerMinute, setCallPricePerMinute] = createSignal<number | undefined>(undefined);
  const [viewportHeight, setViewportHeight] = createSignal<number>(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const [viewportOffset, setViewportOffset] = createSignal<number>(0);

  let messagesContainerRef: HTMLDivElement | undefined;
  let messagesEndRef: HTMLDivElement | undefined;
  let messageInputRef: HTMLInputElement | undefined;

  const checkScrollPosition = () => {
    if (!messagesContainerRef) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsNearBottom(nearBottom);
    setShowScrollButton(!nearBottom && messages().length > 0);
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef?.scrollIntoView({ behavior });
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  // Re-run whenever chatId changes — tears down old listeners and sets up new ones
  createEffect(() => {
    const chatId = props.chatId;
    const currentUser = user();
    if (!currentUser || !chatId) return;

    // Reset state for the new chat
    setMessages([]);
    setOtherUser(null);
    setOtherUserId(null);
    setUnauthorized(false);
    setAuthorized(false);
    setPreviousMessageCount(0);

    let userUnsubscribe: (() => void) | null = null;
    let messagesUnsubscribe: (() => void) | null = null;
    let lastMarkReadTime = 0;
    const MARK_READ_INTERVAL = 2000;

    const chatRef = doc(db, "chats", chatId);
    const chatUnsubscribe = onSnapshot(chatRef, async (chatDoc) => {
      if (!chatDoc.exists()) {
        setUnauthorized(true); setAuthorized(false); setMessages([]); return;
      }
      const chatData = chatDoc.data();
      const participants = chatData.participants || [];
      if (!participants.includes(currentUser.uid)) {
        setUnauthorized(true); setAuthorized(false); setMessages([]); return;
      }
      setUnauthorized(false);
      setAuthorized(true);
      const otherId = participants.find((id: string) => id !== currentUser.uid);
      setOtherUserId(otherId || null);
      if (otherId) {
        userUnsubscribe?.();
        userUnsubscribe = onSnapshot(doc(db, "users", otherId), (userDoc) => {
          if (userDoc.exists()) setOtherUser(userDoc.data());
        });
      }

      // Set up messages listener once authorized
      if (!messagesUnsubscribe) {
        const clearedAt = chatData?.clearedAt?.[currentUser.uid];
        let messagesQuery = query(
          collection(db, "chats", chatId, "messages"),
          orderBy("timestamp", "asc"),
          limit(100)
        );
        if (clearedAt) {
          messagesQuery = query(
            collection(db, "chats", chatId, "messages"),
            where("timestamp", ">", clearedAt),
            orderBy("timestamp", "asc"),
            limit(100)
          );
        }
        lastMarkReadTime = 0;
        messagesUnsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
          const list: Message[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({ id: d.id, text: data.text || "", senderId: data.senderId || "", timestamp: data.timestamp, read: Boolean(data.read) });
          });
          setMessages(list);
          const now = Date.now();
          if (now - lastMarkReadTime > MARK_READ_INTERVAL) {
            lastMarkReadTime = now;
            markMessagesAsRead(chatId, currentUser.uid).catch(() => {});
          }
        });
      }
    });

    onCleanup(() => {
      messagesUnsubscribe?.();
      chatUnsubscribe();
      userUnsubscribe?.();
    });
  });

  onMount(() => {
    // Viewport resize handling (only relevant for full-screen mobile mode)
    if (props.fullScreen && typeof window !== "undefined" && window.visualViewport) {
      const handleResize = () => {
        const h = window.visualViewport?.height || window.innerHeight;
        const offset = window.visualViewport?.offsetTop || 0;
        if (h !== viewportHeight()) setViewportHeight(h);
        if (offset !== viewportOffset()) setViewportOffset(offset);
      };
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
      handleResize();
      onCleanup(() => {
        window.visualViewport?.removeEventListener("resize", handleResize);
        window.visualViewport?.removeEventListener("scroll", handleResize);
      });
    }

    if (props.fullScreen && typeof document !== "undefined") {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      onCleanup(() => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      });
    }
  });

  createEffect(() => {
    const currentCount = messages().length;
    const prevCount = previousMessageCount();
    if (currentCount > prevCount && (isNearBottom() || prevCount === 0)) {
      setTimeout(() => {
        scrollToBottom(prevCount === 0 ? "auto" : "smooth");
        setTimeout(checkScrollPosition, 150);
      }, 100);
    }
    setPreviousMessageCount(currentCount);
  });

  createEffect(() => {
    if (unauthorized()) {
      setTimeout(() => navigate("/chats", { replace: true }), 2000);
    }
  });

  const handleSendMessage = async () => {
    const currentUser = user();
    const text = messageText().trim();
    if (!currentUser || !text || !props.chatId || sending() || !authorized() || unauthorized()) return;
    setMessageText("");
    setSending(true);
    messageInputRef?.focus();
    try {
      await sendMessage(props.chatId, currentUser.uid, text);
      setTimeout(() => scrollToBottom("smooth"), 100);
    } catch {
      setMessageText(text);
    } finally {
      setSending(false);
    }
  };

  const shouldShowCallButton = createMemo(() => {
    const u = otherUser();
    return u?.isHost === true && typeof u?.pricePerMinute === 'number';
  });

  const handleCall = async () => {
    const currentUser = user();
    if (!currentUser || !otherUserId() || sendingCall()) return;
    haptic.trigger(30);
    setSendingCall(true);
    try {
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) { setSendingCall(false); return; }
      await initiateCall(currentUser.uid, otherUserId()!, 'chat');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to initiate call.';
      if (msg.includes('credits')) {
        const match = msg.match(/(\d+(?:\.\d+)?)\s*credits/);
        setCallPricePerMinute(match ? parseFloat(match[1]) : otherUser()?.pricePerMinute);
        setBalanceErrorMessage(msg);
        setShowBalanceError(true);
      } else {
        alert(msg);
      }
    } finally {
      setSendingCall(false);
    }
  };

  const wrapperClass = () => props.fullScreen
    ? "fixed left-0 right-0 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden overscroll-none z-[100]"
    : "flex flex-col h-full bg-white dark:bg-zinc-900 overflow-hidden";

  const wrapperStyle = () => props.fullScreen
    ? { height: `${viewportHeight()}px`, "max-height": `${viewportHeight()}px`, top: `${viewportOffset()}px` }
    : {};

  return (
    <div class={wrapperClass()} style={wrapperStyle()}>
      <Show when={unauthorized()}>
        <div class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <h2 class="text-2xl text-red-600 font-bold mb-4">Access Denied</h2>
            <p class="text-slate-800 dark:text-white mb-4">You are not authorized to view this chat.</p>
            <p class="text-sm text-green-600">Redirecting to chats...</p>
          </div>
        </div>
      </Show>

      <Show when={!unauthorized()}>
        <div class="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-5 py-4 shrink-0 h-[57px] flex items-center">
          <div class="flex items-center gap-3 w-full">
            <Show when={props.fullScreen}>
              <A href="/chats" class="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title="Back to Chats">
                <HiSolidChevronLeft class="w-5 h-5 text-gray-700 dark:text-zinc-300" />
              </A>
            </Show>
            <Show when={!props.fullScreen && props.onBack}>
              <button onClick={props.onBack} class="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors lg:hidden" title="Back">
                <HiSolidChevronLeft class="w-5 h-5 text-gray-700 dark:text-zinc-300" />
              </button>
            </Show>

            <Show when={otherUserId()}>
              <A href={`?profileModal=${otherUserId()}`} class="shrink-0">
                <OnlineIndicator userId={otherUserId() || ""} size="sm">
                  <Show
                    when={otherUser()?.photos?.[0]}
                    fallback={
                      <div class="w-9 h-9 rounded-full bg-[#010b80]/10 dark:bg-white/10 flex items-center justify-center text-[#010b80] dark:text-white font-bold text-sm">
                        {otherUser()?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    }
                  >
                    <img src={otherUser()?.photos?.[0]} alt={otherUser()?.name || "User"} class="w-9 h-9 rounded-full object-cover" />
                  </Show>
                </OnlineIndicator>
              </A>
            </Show>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                {otherUser()?.name || "Unknown User"}
              </p>
              <Show when={otherUser()}>
                <p class="text-xs text-gray-400 dark:text-zinc-500 leading-tight">
                  {(() => {
                    const u = otherUser();
                    if (u?.forcedOnline) return <span class="text-green-500">Online</span>;
                    if (!u?.lastSeen) return "Offline";
                    let t: number;
                    if (typeof u.lastSeen === 'number') t = u.lastSeen;
                    else if (u.lastSeen?.toMillis) t = u.lastSeen.toMillis();
                    else if (u.lastSeen?.seconds) t = u.lastSeen.seconds * 1000;
                    else return "Offline";
                    const diff = Date.now() - t;
                    if (diff < 5 * 60 * 1000) return <span class="text-green-500">Online</span>;
                    const mins = Math.floor(diff / 60000);
                    if (mins < 60) return `${mins}m ago`;
                    const hrs = Math.floor(mins / 60);
                    if (hrs < 24) return `${hrs}h ago`;
                    return "Active recently";
                  })()}
                </p>
              </Show>
            </div>

            <Show when={shouldShowCallButton()}>
              <button
                onClick={handleCall}
                disabled={sendingCall()}
                class="p-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                title={`Call ${otherUser()?.name}`}
              >
                <HiSolidPhone class="w-4 h-4" />
              </button>
            </Show>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          class="flex-1 overflow-y-auto px-4 py-4 relative bg-gray-50 dark:bg-zinc-950"
          onScroll={checkScrollPosition}
        >
          <div class=" mx-auto space-y-2">
            <Show
              when={messages().length > 0}
              fallback={
                <div class="flex flex-col items-center justify-center py-16 gap-2 text-center">
                  <p class="text-sm text-gray-400 dark:text-zinc-500">No messages yet</p>
                  <p class="text-xs text-gray-300 dark:text-zinc-600">Say hello 👋</p>
                </div>
              }
            >
              <For each={messages()}>
                {(message) => {
                  const isOwn = () => message.senderId === user()?.uid;
                  return (
                    <div class={`flex ${isOwn() ? "justify-end" : "justify-start"}`}>
                      <div class={`max-w-[72%] px-3.5 py-2 rounded-2xl ${
                        isOwn()
                          ? "bg-[#010b80] text-white rounded-br-sm"
                          : "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-bl-sm shadow-sm"
                      }`}>
                        <p class="text-sm leading-relaxed">{message.text}</p>
                        <div class={`flex items-center justify-end gap-1 mt-0.5 ${isOwn() ? "text-white/50" : "text-gray-400 dark:text-zinc-500"}`}>
                          <span class="text-[10px]">{formatTime(message.timestamp)}</span>
                          <Show when={isOwn() && message.read}>
                            <AiFillEye class="w-3 h-3" />
                          </Show>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
              <div ref={messagesEndRef} />
            </Show>
          </div>
        </div>

        {/* Scroll to bottom */}
        <Show when={showScrollButton()}>
          <button
            onClick={() => { scrollToBottom("smooth"); setTimeout(checkScrollPosition, 300); }}
            class="absolute bottom-20 right-6 w-9 h-9 bg-[#010b80] hover:bg-[#010b80]/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50"
            title="Scroll to bottom"
          >
            <HiSolidChevronDown class="w-4 h-4" />
          </button>
        </Show>

        {/* Input */}
        <div class="bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 px-4 py-3 shrink-0">
          <div class="flex gap-2 mx-auto">
            <input
              ref={messageInputRef}
              type="text"
              placeholder="Type a message…"
              value={messageText()}
              onInput={(e) => setMessageText(e.currentTarget.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              class="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#010b80]/30 dark:focus:ring-white/20 focus:border-[#010b80] dark:focus:border-zinc-500 placeholder:text-gray-400 dark:placeholder:text-zinc-500 text-sm transition-colors"
            />
            <button
              onClick={handleSendMessage}
              onMouseDown={(e) => e.preventDefault()}
              disabled={!messageText().trim() || sending()}
              class="px-5 py-2.5 bg-[#010b80] hover:bg-[#010b80]/90 disabled:bg-gray-200 dark:disabled:bg-zinc-700 disabled:text-gray-400 dark:disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </Show>

      <BalanceErrorModal
        isOpen={showBalanceError()}
        message={balanceErrorMessage()}
        pricePerMinute={callPricePerMinute()}
        onClose={() => setShowBalanceError(false)}
      />
    </div>
  );
}
