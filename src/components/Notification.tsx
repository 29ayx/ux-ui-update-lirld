import { Show } from "solid-js";

export interface NotificationProps {
    photo?: string;
    title: string;
    body: string;
    onClick?: () => void;
    onClose?: () => void;
}

/**
 * Notification Component
 * Displays a notification bar with photo, title, and body
 * Matches nav width and follows design system
 */
export default function Notification(props: NotificationProps) {
    // Truncate title and body to max lengths
    const truncatedTitle = () => {
        const title = props.title || "";
        return title.length > 70 ? title.substring(0, 67) + "..." : title;
    };

    const truncatedBody = () => {
        const body = props.body || "";
        return body.length > 100 ? body.substring(0, 97) + "..." : body;
    };

    return (
        <div
            class="w-full max-w-md mx-auto px-4 animate-in slide-in-from-top-4 duration-300"
            onClick={props.onClick}
        >
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="flex items-start gap-3 p-4">
                    {/* Photo */}
                    <Show when={props.photo}>
                        <div class="flex-shrink-0">
                            <img
                                src={props.photo}
                                alt="Notification"
                                class="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30"
                            />
                        </div>
                    </Show>

                    {/* Content */}
                    <div class="flex-1 min-w-0">
                        {/* Title */}
                        <h3 class="text-sm font-semibold text-slate-800 dark:text-white truncate mb-1">
                            {truncatedTitle()}
                        </h3>

                        {/* Body */}
                        <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                            {truncatedBody()}
                        </p>
                    </div>

                    {/* Close Button */}
                    <Show when={props.onClose}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onClose?.();
                            }}
                            class="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Close notification"
                        >
                            <svg class="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </Show>
                </div>
            </div>
        </div>
    );
}
