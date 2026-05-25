import { Show, createMemo } from 'solid-js';
import { HiSolidPhone } from 'solid-icons/hi';
import type { CallLog } from '~/lib/callLogs';
import LoadingSpinner from '../LoadingSpinner';
import CallLogUser from './CallLogUser';

interface CallLogItemProps {
  log: CallLog;
  onCall: (userId: string) => void;
  isInitiating: boolean;
}

export default function CallLogItem(props: CallLogItemProps) {
  // Use createMemo to cache computed values and prevent unnecessary recalculations
  const formattedDuration = createMemo(() => {
    const seconds = props.log.duration;
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  });

  const formattedTimestamp = createMemo(() => {
    const now = new Date();
    const callTime = props.log.timestamp.toDate();
    const diffMs = now.getTime() - callTime.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins === 0 ? 'Just now' : `${diffMins}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return callTime.toLocaleDateString();
    }
  });

  // Use createMemo for status-dependent values to prevent recalculation
  const statusColor = createMemo(() => {
    if (props.log.status === 'missed') return 'text-red-900 dark:text-red-400';
    if (props.log.direction === 'incoming') return 'text-green-900 dark:text-teal-300';
    return 'text-blue-800 dark:text-slate-400';
  });

  const DirectionIcon = () => {
    if (props.log.status === 'missed') {
      return (
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    if (props.log.direction === 'incoming') {
      return (
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      );
    }
    return (
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    );
  };

  return (
    <div class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-black rounded-xl shadow-sm hover:shadow-sm dark:hover:bg-[#172554] transition-colors dark:border-[1px] dark:border-gray-900">
      {/* Call Info */}
      <div class="flex-1 min-w-0 flex items-center gap-3">
        <CallLogUser userId={props.log.otherUserId} fallbackName="Unknown User" />

        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span class={`text-xs sm:text-sm ${statusColor()} flex items-center gap-1`}>
              <DirectionIcon />
              <span class="capitalize">{props.log.status}</span>
            </span>
          </div>
          <div class="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex-wrap">
            <span>{formattedTimestamp()}</span>
            <Show when={props.log.status === 'completed'}>
              <span>•</span>
              <span>{formattedDuration()}</span>
            </Show>
            <Show when={props.log.isFree}>
              <span>•</span>
              <span class="text-green-900 dark:text-teal-300">Free</span>
            </Show>
          </div>
        </div>
      </div>

      {/* Call Button */}
      <button
        onClick={() => props.onCall(props.log.otherUserId)}
        disabled={props.isInitiating}
        class="w-11 h-11 rounded-full bg-[#b2f2bb] dark:bg-[#134e4a] hover:bg-[#a3e8b0] dark:hover:bg-[#0f3a38] text-green-900 dark:text-teal-300 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 flex-shrink-0 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2"
        aria-label="Call User"
      >
        <Show when={props.isInitiating} fallback={<HiSolidPhone class="w-5 h-5" />}>
          <LoadingSpinner size="sm" color="text-green-900 dark:text-teal-300" />
        </Show>
      </button>
    </div>
  );
}
