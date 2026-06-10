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
      <div class='flex justify-between'>
       
      <h5 class='font-[700]'>
        Recent Calls
      </h5>
 <span>
  {props.logs.length > 1
    ? `${props.logs.length} Calls`
    : `${props.logs.length} Call`}
</span>
       </div>
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
