import { For, Show, createSignal } from "solid-js";
import Notification, { type NotificationProps } from "./Notification";

export interface NotificationItem extends NotificationProps {
    id: string;
    timestamp: number;
}

interface NotificationContainerProps {
    notifications: NotificationItem[];
    onDismiss?: (id: string) => void;
}

/**
 * NotificationContainer Component
 * Manages multiple notifications in a fixed position
 * Follows nav width constraints
 */
export default function NotificationContainer(props: NotificationContainerProps) {
    return (
        <div class="fixed top-20 left-0 right-0 z-40 pointer-events-none">
            <div class="max-w-md mx-auto px-4 space-y-3 pointer-events-auto">
                <For each={props.notifications}>
                    {(notification) => (
                        <Notification
                            photo={notification.photo}
                            title={notification.title}
                            body={notification.body}
                            onClick={notification.onClick}
                            onClose={() => props.onDismiss?.(notification.id)}
                        />
                    )}
                </For>
            </div>
        </div>
    );
}
