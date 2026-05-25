import { For } from "solid-js";
import UserSection from "./UserSection";
import type { UserProfileWithOnlineStatus } from "~/lib/users";

interface NearbyTabProps {
  usersByCountry: Map<string, UserProfileWithOnlineStatus[]>;
  onMessageSent: (userId: string) => void;
  messagedUserIds?: Set<string>;
}

export default function NearbyTab(props: NearbyTabProps) {
  return (
    <div class="space-y-8 py-6">
      <For each={Array.from(props.usersByCountry.entries())}>
        {([country, countryUsers]) => (
          <UserSection
            icon="🌍"
            title={country}
            users={countryUsers.slice(0, 15)}
            layout="horizontal"
            onMessageSent={props.onMessageSent}
            messagedUserIds={props.messagedUserIds}
          />
        )}
      </For>
    </div>
  );
}
