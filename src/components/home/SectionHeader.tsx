interface SectionHeaderProps {
  icon?: string;
  title: string;
  count?: number;
  countLabel?: string;
}

export default function SectionHeader(props: SectionHeaderProps) {
  return (
    <div class="flex items-center justify-between mb-4 group cursor-default">
      <div class="flex flex-col">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-1 h-3 bg-zinc-300 dark:bg-zinc-700 rounded-full group-hover:bg-indigo-500 transition-colors" />
          <span class="text-[8px] font-black tracking-[0.4em] text-zinc-400 dark:text-zinc-600 uppercase">Connect with</span>
        </div>
        <h2 class="text-xl font-black tracking-tighter text-gray-900 dark:text-white flex items-center gap-2">
          <span class="group-hover:text-indigo-500 transition-colors duration-500">
            {props.title}
          </span>
        </h2>
      </div>
      {props.count !== undefined && (
        <div class="flex flex-col items-end">
          <span class="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">{props.countLabel || "To Explore"}</span>
          <span class="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tighter italic">{props.count}</span>
        </div>
      )}
    </div>
  );
}
