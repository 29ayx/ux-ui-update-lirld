import { For } from "solid-js";
import MinimalProfileCard from "./MinimalProfileCard";
import type { UserProfileWithOnlineStatus } from "~/lib/users";
import SectionHeader from "./SectionHeader";

interface MinimalUserScrollProps {
    users: UserProfileWithOnlineStatus[];
    title: string;
}

export default function MinimalUserScroll(props: MinimalUserScrollProps) {
    return (
        <section class="py-4">
            <SectionHeader
                title={props.title}
                count={props.users.length}
                countLabel="Active Now"
            />
            <div class="overflow-x-auto scrollbar-hide -mx-4 px-4 pt-2">
                <div class="flex items-stretch gap-4 pb-4" style="width: max-content;">
                    <For each={props.users}>
                        {(user) => (
                            <div class="shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
                                <MinimalProfileCard profile={user} />
                            </div>
                        )}
                    </For>
                </div>
            </div>
        </section>
    );
}
