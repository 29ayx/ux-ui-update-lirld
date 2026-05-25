import { For } from "solid-js";
import ProfileCard from "~/components/ProfileCard";
import type { UserProfileWithOnlineStatus } from "~/lib/users";

interface UserGridProps {
  users: UserProfileWithOnlineStatus[];
  onMessageSent: (userId: string) => void;
  messagedUserIds?: Set<string>;
}

export default function UserGrid(props: UserGridProps) {
  return (
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 mt-2">
      <For each={props.users}>
        {(user) => (
          <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex mt-2">
            <ProfileCard
              profile={user}
              onMessageSent={props.onMessageSent}
              isMessaged={props.messagedUserIds?.has(user.user_id)}
            />
          </div>
        )}
      </For>
    </div>
  );
}
