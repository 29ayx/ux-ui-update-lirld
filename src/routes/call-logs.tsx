import { createSignal, createMemo, onMount, onCleanup, Show } from 'solid-js';
import { useAuth } from '~/lib/auth';
import { subscribeToCallLogs, type CallLog } from '~/lib/callLogs';
import { initiateCall } from '~/lib/calls';
import CallLogsHeader from '~/components/call/CallLogsHeader';
import CallLogsFilters from '~/components/call/CallLogsFilters';
import CallLogsList from '~/components/call/CallLogsList';
import EmptyState from '~/components/call/EmptyState';
import LoadingState from '~/components/home/LoadingState';
import BalanceErrorModal from '~/components/BalanceErrorModal';

export default function CallLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = createSignal<CallLog[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [activeFilter, setActiveFilter] = createSignal<'all' | 'missed' | 'incoming' | 'outgoing'>('all');
  const [initiatingCallId, setInitiatingCallId] = createSignal<string | null>(null);
  const [showBalanceError, setShowBalanceError] = createSignal(false);
  const [balanceErrorMessage, setBalanceErrorMessage] = createSignal("");
  const [callPricePerMinute, setCallPricePerMinute] = createSignal<number | undefined>(undefined);

  // Computed filtered logs based on active filter
  const filteredLogs = createMemo(() => {
    const filter = activeFilter();
    const allLogs = logs();

    if (filter === 'all') return allLogs;
    if (filter === 'missed') return allLogs.filter(log => log.status === 'missed');
    if (filter === 'incoming') return allLogs.filter(log => log.direction === 'incoming');
    if (filter === 'outgoing') return allLogs.filter(log => log.direction === 'outgoing');

    return allLogs;
  });

  // Handle call initiation from log entries
  const handleCallUser = async (userId: string) => {
    setInitiatingCallId(userId);

    try {
      const currentUser = user();
      if (!currentUser) {
        throw new Error('You must be logged in to make a call');
      }

      await initiateCall(currentUser.uid, userId, 'general');

      // Call initiated successfully - the CallModal should handle the rest
      // Reset initiating state after a short delay
      setTimeout(() => {
        setInitiatingCallId(null);
      }, 1000);
    } catch (error: any) {
      // Log error for debugging
      console.error('Failed to initiate call:', error);

      // Display user-friendly error message
      const errorMessage = error.message || 'Failed to initiate call. Please try again.';

      // Check if it's a balance error
      if (errorMessage.includes('Insufficient credits') || errorMessage.includes('credits')) {
        // Extract price from error message
        const priceMatch = errorMessage.match(/(\d+(?:\.\d+)?)\s*credits/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : undefined;
        setCallPricePerMinute(price);
        setBalanceErrorMessage(errorMessage);
        setShowBalanceError(true);
      } else {
        // For other errors, show alert (can be replaced with another modal later)
        alert(errorMessage);
      }

      // Reset initiating state immediately on error
      setInitiatingCallId(null);
    }
  };

  // Subscribe to call logs on mount
  onMount(() => {
    const currentUser = user();
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToCallLogs(
      currentUser.uid,
      (updatedLogs) => {
        setLogs(updatedLogs);
        setLoading(false);
      },
      50
    );

    onCleanup(() => unsubscribe());
  });

  return (
    <div class="min-h-screen bg-[#F0F4F8] dark:bg-black text-gray-900 dark:text-zinc-100 flex transition-colors duration-500 relative overflow-x-hidden">

      
      <main class="flex-1 w-full min-w-0 pb-32 lg:pb-12 z-10 relative">
        <CallLogsHeader />
        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <CallLogsFilters
            activeFilter={activeFilter()}
            onFilterChange={setActiveFilter}
          />
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Show when={!loading()} fallback={<LoadingState />}>
            <Show when={filteredLogs().length > 0} fallback={<EmptyState filter={activeFilter()} />}>
              <CallLogsList
                logs={filteredLogs()}
                onCallUser={handleCallUser}
                initiatingCallId={initiatingCallId()}
              />
            </Show>
          </Show>
        </div>

        {/* Balance Error Modal */}
        <BalanceErrorModal
          isOpen={showBalanceError()}
          message={balanceErrorMessage()}
          pricePerMinute={callPricePerMinute()}
          onClose={() => setShowBalanceError(false)}
        />
      </main>
    </div>
  );
}
