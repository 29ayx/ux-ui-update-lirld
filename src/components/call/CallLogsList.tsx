import { For } from 'solid-js';
import type { CallLog } from '~/lib/callLogs';
import CallLogItem from './CallLogItem';

interface CallLogsListProps {
  logs: CallLog[];
  onCallUser: (userId: string) => void;
  initiatingCallId: string | null;
}

export default function CallLogsList(props: CallLogsListProps) {
  return (
    <div class="space-y-3">
      <For each={props.logs}>
        {(log) => (
          <CallLogItem
            log={log}
            onCall={props.onCallUser}
            isInitiating={props.initiatingCallId === log.otherUserId}
          />
        )}
      </For>
    </div>
  );
}
