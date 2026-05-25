import { createSignal } from "solid-js";
import { A } from "@solidjs/router";

interface HostPromoCardCompactProps {
  userId: string;
}

export default function HostPromoCardCompact(props: HostPromoCardCompactProps) {
  const [isVisible, setIsVisible] = createSignal(true);

  if (!isVisible()) return null;

  return (
    <div class="bg-[#111] rounded-2xl p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-white font-semibold text-sm">Become a Host</h3>
          <p class="text-white/50 text-xs">Earn by taking calls</p>
        </div>

        <A
          href="/host/apply"
          class="px-4 py-2 bg-white text-black font-semibold text-sm rounded-xl flex-shrink-0"
        >
          Apply
        </A>
      </div>
    </div>
  );
}
