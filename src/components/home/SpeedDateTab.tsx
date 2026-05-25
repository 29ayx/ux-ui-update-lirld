import { Show, For } from "solid-js";
import SpeedDateBanner from "./SpeedDateBanner";
import HowItWorks from "./HowItWorks";
import UserSection from "./UserSection";
import EmptyState from "./EmptyState";
import ProfileCard from "~/components/ProfileCard";
import type { UserProfileWithOnlineStatus } from "~/lib/users";

interface SpeedDateTabProps {
    onlineHosts: UserProfileWithOnlineStatus[];
    allHostUsers: UserProfileWithOnlineStatus[];
    onMessageSent: (userId: string) => void;
    messagedUserIds?: Set<string>;
}

export default function SpeedDateTab(props: SpeedDateTabProps) {
    return (
        <div class="space-y-8 py-6">
            <SpeedDateBanner />

            <UserSection
                icon="🟢"
                title="Available Now"
                users={props.onlineHosts}
                countLabel="hosts online"
                layout="grid"
                onMessageSent={props.onMessageSent}
                messagedUserIds={props.messagedUserIds}
            />

            <section>
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white flex items-center gap-2">
                        <span>⭐</span>
                        <span>All Hosts</span>
                    </h2>
                    <span class="text-xs text-white/60">{props.allHostUsers.length} hosts</span>
                </div>
                <Show
                    when={props.allHostUsers.length > 0}
                    fallback={
                        <EmptyState
                            icon="💬"
                            title="No hosts available yet"
                            subtitle="Check back soon for verified hosts!"
                        />
                    }
                >
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-2">
                        <For each={props.allHostUsers}>
                            {(user) => (
                                <ProfileCard
                                    profile={user}
                                    onMessageSent={props.onMessageSent}
                                    isMessaged={props.messagedUserIds?.has(user.user_id)}
                                />
                            )}
                        </For>
                    </div>
                </Show>
            </section>

            <HowItWorks />
        </div>
    );
}
