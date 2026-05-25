import { JSX } from "solid-js";
import { IoSearchOutline } from "solid-icons/io";

interface PageHeaderProps {
  title: string;
  right?: JSX.Element;
}

export default function PageHeader(props: PageHeaderProps) {
  return (
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-zinc-800/50">
      <div class="px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight shrink-0">
          {props.title}
        </h1>
        <div class="flex flex-1 items-center justify-end gap-3">
          <div class="relative w-full max-w-md group">
            <IoSearchOutline class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-gray-400 group-focus-within:text-[#010b80] transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              class="w-full bg-gray-100/50 dark:bg-zinc-900/50 border border-transparent focus:border-[#010b80]/30 focus:bg-white dark:focus:bg-zinc-900 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 transition-all outline-none focus:ring-2 focus:ring-[#010b80]/20"
            />
          </div>
          {props.right}
        </div>
      </div>
    </header>
  );
}
