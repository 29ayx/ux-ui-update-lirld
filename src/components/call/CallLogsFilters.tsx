import { BsArrowUp } from 'solid-icons/bs'
import { RiArrowsArrowDownLongLine } from 'solid-icons/ri'

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
      <h4>
     
      </h4>
    <div
  class=" w-fit bg-white dark:bg-black rounded-xl p-3 border border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-hide shadow-sm"
  role="tablist"
  aria-label="Call log filters"
>
        {filters.map((filter) => (
        <button
  onClick={() => props.onFilterChange(filter.value)}
  role="tab"
  aria-selected={props.activeFilter === filter.value}
  aria-label={`Filter by ${filter.label.toLowerCase()} calls`}
  class={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 ${
    props.activeFilter === filter.value
      ? 'bg-[#a5d8ff] dark:bg-[#3b82f6] text-sky-900 dark:text-white shadow-sm'
      : 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 hover:bg-[#d0ebff] dark:hover:bg-[#172554]'
  }`}
>
  <span>{filter.label}</span>

  {filter.value === 'missed' && (
    <span class="text-pink-500 text-[10px] leading-none">●</span>
  )}

  {filter.value === 'incoming' && (
    <RiArrowsArrowDownLongLine class="text-green-500 text-sm" />
  )}

  {filter.value === 'outgoing' && (
    <BsArrowUp class="text-blue-500 text-xs" />
  )}
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
