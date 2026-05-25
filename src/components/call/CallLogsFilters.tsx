interface CallLogsFiltersProps {
  activeFilter: 'all' | 'missed' | 'incoming' | 'outgoing';
  onFilterChange: (filter: 'all' | 'missed' | 'incoming' | 'outgoing') => void;
}

export default function CallLogsFilters(props: CallLogsFiltersProps) {
  const filters = [
    { value: 'all' as const, label: 'All' },
    { value: 'missed' as const, label: 'Missed' },
    { value: 'incoming' as const, label: 'Incoming' },
    { value: 'outgoing' as const, label: 'Outgoing' },
  ];

  return (
    <div class="pb-4 mt-4">
      <div class="pl-2 flex pb-1 items-center gap-2 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Call log filters">
        {filters.map((filter) => (
          <button
            onClick={() => props.onFilterChange(filter.value)}
            role="tab"
            aria-selected={props.activeFilter === filter.value}
            aria-label={`Filter by ${filter.label.toLowerCase()} calls`}
            class={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all active:scale-95 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 ${
              props.activeFilter === filter.value
                ? 'bg-[#a5d8ff] dark:bg-[#3b82f6] text-sky-900 dark:text-white shadow-sm'
                : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 hover:bg-[#d0ebff] dark:hover:bg-[#172554] dark:border-[1px] dark:border-gray-900'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
