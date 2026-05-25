import { For } from "solid-js";
import UserSection from "./UserSection";
import type { UserProfileWithOnlineStatus } from "~/lib/users";

interface ExploreTabProps {
  usersByAgeRange: Map<string, UserProfileWithOnlineStatus[]>;
  usersByGender: Map<string, UserProfileWithOnlineStatus[]>;
  onMessageSent: (userId: string) => void;
  messagedUserIds?: Set<string>;
}

export default function ExploreTab(props: ExploreTabProps) {
  return (
    <div class="space-y-8 py-6">
      <For each={Array.from(props.usersByAgeRange.entries())}>
        {([range, rangeUsers]) => (
          <UserSection
            icon="🎂"
            title={`Age ${range}`}
            users={rangeUsers}
            layout="horizontal"
            onMessageSent={props.onMessageSent}
            messagedUserIds={props.messagedUserIds}
          />
        )}
      </For>

      <For each={Array.from(props.usersByGender.entries())}>
        {([gender, genderUsers]) => (
          <UserSection
            icon="👤"
            title={gender.charAt(0).toUpperCase() + gender.slice(1)}
            users={genderUsers.slice(0, 15)}
            layout="horizontal"
            onMessageSent={props.onMessageSent}
            messagedUserIds={props.messagedUserIds}
          />
        )}
      </For>
    </div>
  );
}
