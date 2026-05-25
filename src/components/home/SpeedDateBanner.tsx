export default function SpeedDateBanner() {
  return (
    <div class="bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm relative overflow-hidden group">
      <div class="absolute inset-0 bg-indigo-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div class="flex items-start gap-4 relative z-10">
        <div class="w-12 h-12 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <span class="text-2xl">⚡</span>
        </div>
        <div>
          <h3 class="text-gray-900 dark:text-white font-black tracking-tight text-lg mb-1">NODE SYNC PROTOCOL</h3>
          <p class="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed">
            Connect instantly with verified active nodes for ultra-low latency sessions. Rates from $0.10/min.
          </p>
        </div>
      </div>
    </div>
  );
}
