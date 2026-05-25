import { Show } from "solid-js";
import UserSection from "./UserSection";
import EmptyState from "./EmptyState";
import type { UserProfileWithOnlineStatus } from "~/lib/users";
import { shuffleArray } from "~/hooks/useUserFilters";

interface OnlineTabProps {
  onlineUsers: UserProfileWithOnlineStatus[];
  onMessageSent: (userId: string) => void;
  messagedUserIds?: Set<string>;
}

export default function OnlineTab(props: OnlineTabProps) {
  return (
    <div class="space-y-8 py-6">
      <Show
        when={props.onlineUsers.length > 0}
        fallback={<EmptyState title="No one is online right now" />}
      >
        <UserSection
          icon="🟢"
          title="Online Now"
          users={shuffleArray(props.onlineUsers)}
          countLabel="online"
          layout="grid"
          onMessageSent={props.onMessageSent}
          messagedUserIds={props.messagedUserIds}
        />
      </Show>
    </div>
  );
}
