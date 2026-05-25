import { Show } from "solid-js";
import SectionHeader from "./SectionHeader";
import HorizontalUserScroll from "./HorizontalUserScroll";
import UserGrid from "./UserGrid";
import type { UserProfileWithOnlineStatus } from "~/lib/users";

interface UserSectionProps {
  icon?: string;
  title: string;
  users: UserProfileWithOnlineStatus[];
  countLabel?: string;
  layout?: "horizontal" | "grid";
  onMessageSent: (userId: string) => void;
  emptyMessage?: string;
  messagedUserIds?: Set<string>;
}

export default function UserSection(props: UserSectionProps) {
  return (
    <Show when={props.users.length > 0}>
      <section>
        <SectionHeader
          icon={props.icon}
          title={props.title}
          count={props.users.length}
          countLabel={props.countLabel}
        />
        {props.layout === "grid" ? (
          <UserGrid
            users={props.users}
            onMessageSent={props.onMessageSent}
            messagedUserIds={props.messagedUserIds}
          />
        ) : (
          <HorizontalUserScroll
            users={props.users}
            onMessageSent={props.onMessageSent}
            messagedUserIds={props.messagedUserIds}
          />
        )}
      </section>
    </Show>
  );
}
