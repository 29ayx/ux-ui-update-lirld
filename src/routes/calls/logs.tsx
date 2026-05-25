import { createSignal, createResource, Show, For, createMemo, onCleanup } from "solid-js";
import { A } from "@solidjs/router";
import { useAuth } from "~/lib/auth";
import { subscribeToCallLogs, type CallLog } from "~/lib/callLogs";
import { Timestamp } from "firebase/firestore";

type FilterType = 'all' | 'free' | 'paid';
type DirectionFilter = 'all' | 'incoming' | 'outgoing';

export default function CallLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = createSignal<CallLog[]>([]);
  const [selectedLog, setSelectedLog] = createSignal<CallLog | null>(null);
  const [filterType, setFilterType] = createSignal<FilterType>('all');
  const [directionFilter, setDirectionFilter] = createSignal<DirectionFilter>('all');
  const [dateRange, setDateRange] = createSignal<'all' | 'today' | 'week' | 'month'>('all');

  // Subscribe to call logs
  createResource(
    () => user()?.uid,
    (userId) => {
      if (!userId) return;
      
      const unsubscribe = subscribeToCallLogs(userId, (newLogs) => {
        setLogs(newLogs);
      });

      onCleanup(() => unsubscribe());
    }
  );

  // Filter logs based on selected filters
  const filteredLogs = createMemo(() => {
    let filtered = logs();

    // Filter by call type (free/paid)
    if (filterType() !== 'all') {
      filtered = filtered.filter(log => 
        filterType() === 'free' ? log.isFree : !log.isFree
      );
    }

    // Filter by direction
    if (directionFilter() !== 'all') {
      filtered = filtered.filter(log => log.direction === directionFilter());
    }

    // Filter by date range
    if (dateRange() !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter(log => {
        const logDate = log.timestamp.toDate();
        switch (dateRange()) {
          case 'today':
            return logDate >= startOfToday;
          case 'week':
            return logDate >= startOfWeek;
          case 'month':
            return logDate >= startOfMonth;
          default:
            return true;
        }
      });
    }

    return filtered;
  });

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const formatTimestamp = (timestamp: Timestamp): string => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatFullTimestamp = (timestamp: Timestamp): string => {
    return timestamp.toDate().toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <main class="min-h-screen bg-black pb-24">
      <div class="max-w-4xl mx-auto">
        {/* Header */}
        <div class="px-4 sm:px-6 pt-8 pb-6">
          <div class="flex items-center gap-3 mb-2">
            <A href="/" class="p-2 bg-[#111] rounded-xl hover:bg-[#1a1a1a] transition-colors">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </A>
            <h1 class="text-3xl font-bold text-white tracking-tight">Call History</h1>
          </div>
          <p class="text-white/60 text-sm">View all your past calls and details</p>
        </div>

        {/* Filters */}
        <div class="px-4 sm:px-6 pb-4 space-y-3">
          {/* Call Type Filter */}
          <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setFilterType('all')}
              class={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filterType() === 'all'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All Calls
            </button>
            <button
              onClick={() => setFilterType('free')}
              class={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filterType() === 'free'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setFilterType('paid')}
              class={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filterType() === 'paid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Paid
            </button>
          </div>

          {/* Direction & Date Filters */}
          <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <select
              value={directionFilter()}
              onChange={(e) => setDirectionFilter(e.target.value as DirectionFilter)}
              class="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="all">All Directions</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
            </select>

            <select
              value={dateRange()}
              onChange={(e) => setDateRange(e.target.value as any)}
              class="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Results Count */}
          <div class="text-white/60 text-sm">
            {filteredLogs().length} {filteredLogs().length === 1 ? 'call' : 'calls'} found
          </div>
        </div>

        {/* Call Logs List */}
        <div class="px-4 sm:px-6">
          <Show
            when={filteredLogs().length > 0}
            fallback={
              <div class="text-center py-16">
                <div class="inline-block p-8 rounded-2xl bg-[#111]">
                  <div class="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <p class="text-white font-medium mb-2">No calls yet</p>
                  <p class="text-white/60 text-sm">Your call history will appear here</p>
                </div>
              </div>
            }
          >
            <div class="space-y-2">
              <For each={filteredLogs()}>
                {(log) => (
                  <button
                    onClick={() => setSelectedLog(log)}
                    class="w-full bg-[#111] hover:bg-[#1a1a1a] rounded-2xl p-4 transition-all text-left border border-transparent hover:border-white/10"
                  >
                    <div class="flex items-center gap-4">
                      {/* User Photo */}
                      <div class="relative flex-shrink-0">
                        <Show
                          when={log.otherUserPhoto}
                          fallback={
                            <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                              <span class="text-white text-lg font-medium">
                                {log.otherUserName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          }
                        >
                          <img
                            src={log.otherUserPhoto}
                            alt={log.otherUserName}
                            class="w-12 h-12 rounded-full object-cover"
                          />
                        </Show>
                        
                        {/* Direction Indicator */}
                        <div class={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                          log.direction === 'incoming' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {log.direction === 'incoming' ? (
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            ) : (
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            )}
                          </svg>
                        </div>
                      </div>

                      {/* Call Info */}
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h3 class="text-white font-medium truncate">{log.otherUserName}</h3>
                          <Show when={log.isFree}>
                            <span class="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                              Free
                            </span>
                          </Show>
                        </div>
                        
                        <div class="flex items-center gap-3 text-sm text-white/60">
                          <span class="capitalize">{log.direction}</span>
                          <span>•</span>
                          <span class={
                            log.status === 'completed' ? 'text-green-400' :
                            log.status === 'declined' ? 'text-red-400' :
                            'text-yellow-400'
                          }>
                            {log.status === 'completed' ? 'Completed' :
                             log.status === 'declined' ? 'Declined' :
                             'Missed'}
                          </span>
                          <Show when={log.status === 'completed'}>
                            <>
                              <span>•</span>
                              <span>{formatDuration(log.duration)}</span>
                            </>
                          </Show>
                        </div>
                      </div>

                      {/* Cost & Time */}
                      <div class="text-right flex-shrink-0">
                        <Show
                          when={!log.isFree && log.cost > 0}
                          fallback={
                            <div class="text-green-400 font-medium text-sm mb-1">Free</div>
                          }
                        >
                          <div class="text-white font-medium text-sm mb-1">
                            {log.cost.toFixed(2)} credits
                          </div>
                        </Show>
                        <div class="text-white/60 text-xs">
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </div>
                    </div>
                  </button>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>

      {/* Detail Modal */}
      <Show when={selectedLog()}>
        {(log) => (
          <div
            class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedLog(null)}
          >
            <div
              class="bg-[#111] rounded-2xl max-w-md w-full p-6 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-white">Call Details</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  class="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div class="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                <Show
                  when={log().otherUserPhoto}
                  fallback={
                    <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                      <span class="text-white text-2xl font-medium">
                        {log().otherUserName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  }
                >
                  <img
                    src={log().otherUserPhoto}
                    alt={log().otherUserName}
                    class="w-16 h-16 rounded-full object-cover"
                  />
                </Show>
                <div>
                  <h3 class="text-white font-bold text-lg">{log().otherUserName}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class={`px-2 py-1 rounded-full text-xs font-medium ${
                      log().direction === 'incoming' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {log().direction === 'incoming' ? '📞 Incoming' : '📱 Outgoing'}
                    </span>
                    <Show when={log().isFree}>
                      <span class="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                        Free Call
                      </span>
                    </Show>
                  </div>
                </div>
              </div>

              {/* Call Details */}
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-white/60 text-sm">Status</span>
                  <span class={`font-medium text-sm ${
                    log().status === 'completed' ? 'text-green-400' :
                    log().status === 'declined' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {log().status === 'completed' ? '✓ Completed' :
                     log().status === 'declined' ? '✗ Declined' :
                     '⊘ Missed'}
                  </span>
                </div>

                <Show when={log().status === 'completed'}>
                  <div class="flex justify-between items-center">
                    <span class="text-white/60 text-sm">Duration</span>
                    <span class="text-white font-medium text-sm">
                      {formatDuration(log().duration)}
                    </span>
                  </div>
                </Show>

                <div class="flex justify-between items-center">
                  <span class="text-white/60 text-sm">Cost</span>
                  <span class="text-white font-medium text-sm">
                    {log().isFree || log().cost === 0 ? 'Free' : `${log().cost.toFixed(2)} credits`}
                  </span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-white/60 text-sm">Date & Time</span>
                  <span class="text-white font-medium text-sm">
                    {formatFullTimestamp(log().timestamp)}
                  </span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-white/60 text-sm">Call ID</span>
                  <span class="text-white/60 font-mono text-xs">
                    {log().callId.slice(0, 8)}...
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div class="mt-6 pt-6 border-t border-white/10">
                <A
                  href={`?profileModal=${log().otherUserId}`}
                  class="w-full px-4 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors text-center block"
                  onClick={() => setSelectedLog(null)}
                >
                  View Profile
                </A>
              </div>
            </div>
          </div>
        )}
      </Show>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        select option {
          background-color: #111;
          color: white;
        }
      `}</style>
    </main>
  );
}
