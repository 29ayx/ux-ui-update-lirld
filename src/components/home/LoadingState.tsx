export default function LoadingState() {
  return (
    <div class="text-center text-slate-700 dark:text-slate-300 mt-12">
      <div class="inline-flex items-center gap-2">
        <div class="w-2 h-2 bg-slate-700 dark:bg-slate-300 rounded-full animate-pulse"></div>
        <div class="w-2 h-2 bg-slate-700 dark:bg-slate-300 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
        <div class="w-2 h-2 bg-slate-700 dark:bg-slate-300 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
      </div>
      <p class="mt-4 text-sm">Loading users...</p>
    </div>
  );
}
