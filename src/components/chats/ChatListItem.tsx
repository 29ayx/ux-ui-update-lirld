import { Show, createSignal, createMemo } from "solid-js";
import { A } from "@solidjs/router";
import { FaSolidTrash, FaSolidEllipsis } from 'solid-icons/fa';
import OnlineIndicator from "~/components/OnlineIndicator";
import { formatTime, toDate } from "~/lib/dateUtils";
import type { ChatData, ChatMetadata } from "~/types/chat";

interface ChatListItemProps {
    chat: ChatData;
    currentUserId: string;
    otherUserId: string;
    otherUserName: string;
    imageUrl: string;
    hasImage: boolean;
    metadata: ChatMetadata;
    onDelete: () => void;
    onSelect?: () => void;
    isSelected?: boolean;
}

export default function ChatListItem(props: ChatListItemProps) {
    const [offsetX, setOffsetX] = createSignal(0);
    const [isSwiping, setIsSwiping] = createSignal(false);
    const [isPressed, setIsPressed] = createSignal(false);
    const [showMenu, setShowMenu] = createSignal(false);

    let startX = 0;
    let startY = 0;
    let isHorizontalSwipe = false;

    const BUTTON_WIDTH = 70;
    const MAX_SWIPE = -BUTTON_WIDTH;
    const SNAP_THRESHOLD = MAX_SWIPE / 2;

    const handleTouchStart = (e: TouchEvent) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        setIsSwiping(true);
        setIsPressed(true);
        isHorizontalSwipe = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isSwiping()) return;
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - startX;
        const diffY = currentY - startY;
        if (!isHorizontalSwipe) {
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 5) {
                isHorizontalSwipe = true;
            } else if (Math.abs(diffY) > 5) {
                setIsSwiping(false);
                return;
            }
        }
        if (isHorizontalSwipe) {
            e.preventDefault();
            let newOffset = diffX;
            if (newOffset > 0) newOffset = 0;
            if (newOffset < MAX_SWIPE) {
                const extra = newOffset - MAX_SWIPE;
                newOffset = MAX_SWIPE + extra * 0.2;
            }
            setOffsetX(newOffset);
        }
    };

    const handleTouchEnd = () => {
        setIsSwiping(false);
        setIsPressed(false);
        setOffsetX(offsetX() < SNAP_THRESHOLD ? MAX_SWIPE : 0);
    };

    const isLastMessageFromOther = createMemo(() =>
        props.metadata.lastSenderId && props.metadata.lastSenderId !== props.currentUserId
    );

    const isLastMessageFromMe = createMemo(() =>
        props.metadata.lastSenderId && props.metadata.lastSenderId === props.currentUserId
    );

    return (
        <li class={`relative overflow-hidden rounded-2xl select-none transition-all duration-150 ${props.isSelected ? "shadow-md" : ""}`}>
            {/* Swipe-to-delete background */}
            <div class="absolute right-0 top-0 bottom-0 flex h-full">
                <button
                    onClick={(e) => { e.stopPropagation(); props.onDelete(); setOffsetX(0); }}
                    class="w-[70px] h-full flex flex-col items-center justify-center text-white transition-colors"
                    aria-label="Delete chat"
                >
                    <FaSolidTrash size={18} />
                    <span class="text-[10px] font-semibold mt-1 tracking-wide">Delete</span>
                </button>
            </div>

            {/* Foreground */}
            <div
                class={`relative z-10 transition-transform duration-300 ease-out ${
                    props.isSelected
                        ? "bg-gray-100 dark:bg-zinc-800"
                        : "bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800"
                } ${isPressed() ? "opacity-90" : ""}`}
                style={{
                    transform: `translateX(${offsetX()}px)`,
                    "transition-property": isSwiping() ? "none" : "transform",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <A
                    href={`/chats/${props.chat.id}`}
                    class="block px-4 py-3.5"
                    onClick={(e) => {
                        if (Math.abs(offsetX()) > 5) { e.preventDefault(); return; }
                        if (props.onSelect) { e.preventDefault(); props.onSelect(); }
                    }}
                    aria-label={`Chat with ${props.otherUserName}`}
                >
                    <div class="flex items-center gap-3">
                        {/* Avatar */}
                        <div class="shrink-0">
                            <OnlineIndicator userId={props.otherUserId} size="sm">
                                <Show
                                    when={props.hasImage}
                                    fallback={
                                        <div class={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base relative ${props.isSelected ? "bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200" : "bg-[#010b80]/80 text-[#010b80] dark:bg-white/10 dark:text-white"}`}>
                                            {props.otherUserName.charAt(0).toUpperCase() || "?"}
                                            <Show when={props.metadata.unreadCount > 0}>
                                                <span class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                    {props.metadata.unreadCount > 9 ? "9+" : props.metadata.unreadCount}
                                                </span>
                                            </Show>
                                        </div>
                                    }
                                >
                                    <div class="relative">
                                        <img
                                            src={props.imageUrl}
                                            alt={props.otherUserName}
                                            class="w-11 h-11 rounded-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <Show when={props.metadata.unreadCount > 0}>
                                            <span class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                {props.metadata.unreadCount > 9 ? "9+" : props.metadata.unreadCount}
                                            </span>
                                        </Show>
                                    </div>
                                </Show>
                            </OnlineIndicator>
                        </div>

                        {/* Text content */}
                        <div class="flex-1 min-w-0">
                            <div class="flex items-baseline justify-between gap-2 mb-0.5">
                                <span class={`font-semibold text-sm truncate ${props.isSelected ? "text-gray-900 dark:text-white" : "text-gray-900 dark:text-white"}`}>
                                    {props.otherUserName}
                                </span>
                                <Show when={props.chat.lastMessageTime}>
                                    <time
                                        class={`text-[11px] shrink-0 ${props.isSelected ? "text-gray-400 dark:text-zinc-500" : "text-gray-400 dark:text-zinc-500"}`}
                                        dateTime={toDate(props.chat.lastMessageTime)?.toISOString()}
                                    >
                                        {formatTime(props.chat.lastMessageTime)}
                                    </time>
                                </Show>
                            </div>

                            <div class="flex items-center gap-2">
                                <p class={`text-xs truncate flex-1 min-w-0 ${props.isSelected ? "text-gray-500 dark:text-zinc-400" : "text-gray-500 dark:text-zinc-400"}`}>
                                    {props.chat.lastMessage || "No messages yet"}
                                </p>

                                <Show when={isLastMessageFromOther()}>
                                    <span class="shrink-0 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-semibold">
                                        new
                                    </span>
                                </Show>
                                <Show when={isLastMessageFromMe()}>
                                    <span class={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                        props.metadata.lastMessageRead
                                            ? props.isSelected ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                            : props.isSelected ? "bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400" : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400"
                                    }`}>
                                        {props.metadata.lastMessageRead ? "seen" : "sent"}
                                    </span>
                                </Show>
                            </div>
                        </div>

                        {/* Desktop options menu */}
                        <div class="relative hidden md:block shrink-0">
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu()); }}
                                class={`p-1.5 rounded-full transition-colors ${props.isSelected ? "hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300" : "hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
                                aria-label="Chat options"
                            >
                                <FaSolidEllipsis size={14} />
                            </button>
                            <Show when={showMenu()}>
                                <div class="fixed inset-0 z-40" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); }} />
                                <div class="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-700 py-1 z-50">
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); props.onDelete(); setShowMenu(false); }}
                                        class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                                    >
                                        <FaSolidTrash size={13} />
                                        Delete
                                    </button>
                                </div>
                            </Show>
                        </div>
                    </div>
                </A>
            </div>
        </li>
    );
}
