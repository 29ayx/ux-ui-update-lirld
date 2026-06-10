import { HiSolidPhone } from 'solid-icons/hi';
import { AiOutlineClose } from 'solid-icons/ai'
import { BsArrowUp } from 'solid-icons/bs'
import { RiArrowsArrowDownLongLine } from 'solid-icons/ri'

interface CallLogsStatsProps {
  totalCount: number;
  missedCount: number;
  incomingCount: number;
  outgoingCount: number;
  onFilterChange?: (
    filter: 'all' | 'missed' | 'incoming' | 'outgoing'
  ) => void;
}

export default function CallLogsStats(props: CallLogsStatsProps) {
  return (
    <div class="mt-4 bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-200 dark:divide-slate-800">

        {/* Total */}
        <button
          onClick={() => props.onFilterChange?.('all')}
          class="p-5 text-left hover:bg-slate-50 dark:hover:bg-[#172554] transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <HiSolidPhone class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>

            <div>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {props.totalCount}
              </p>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                Total Calls
              </p>
            </div>
          </div>
        </button>

        {/* Missed */}
        <button
          onClick={() => props.onFilterChange?.('missed')}
          class="p-5 text-left hover:bg-slate-50 dark:hover:bg-[#172554] transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AiOutlineClose class='w-[24px] h-18 '/>
            </div>

            <div>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {props.missedCount}
              </p>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                Missed
              </p>
            </div>
          </div>
        </button>

        {/* Incoming */}
        <button
          onClick={() => props.onFilterChange?.('incoming')}
          class="p-5 text-left hover:bg-slate-50 dark:hover:bg-[#172554] transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <RiArrowsArrowDownLongLine  class='h-[24px]'/>
            </div>

            <div>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {props.incomingCount}
              </p>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                Incoming
              </p>
            </div>
          </div>
        </button>

        {/* Outgoing */}
        <button
          onClick={() => props.onFilterChange?.('outgoing')}
          class="p-5 text-left hover:bg-slate-50 dark:hover:bg-[#172554] transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <BsArrowUp  class='h-[24px]'/>
            </div>

            <div>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {props.outgoingCount}
              </p>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                Outgoing
              </p>
            </div>
          </div>
        </button>

      </div>
    </div>
  );
}