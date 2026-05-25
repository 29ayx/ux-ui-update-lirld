import { For } from "solid-js";
import ProfileCard from "~/components/ProfileCard";
import type { UserProfileWithOnlineStatus } from "~/lib/users";

interface HorizontalUserScrollProps {
  users: UserProfileWithOnlineStatus[];
  onMessageSent: (userId: string) => void;
  messagedUserIds?: Set<string>;
}

export default function HorizontalUserScroll(props: HorizontalUserScrollProps) {
  return (
    <div class="overflow-x-auto scrollbar-hide -mx-4 px-4 pt-2">
      <div class="flex items-stretch gap-3 pb-4" style="width: max-content;">
        <For each={props.users}>
          {(user) => (
            <div class="w-min-content max-w-[85vw] shrink-0 pt-2 animate-in fade-in duration-200 flex">
              <ProfileCard
                profile={user}
                onMessageSent={props.onMessageSent}
                isMessaged={props.messagedUserIds?.has(user.user_id)}
              />
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
