import { A } from "@solidjs/router";
import {
  IoSearchOutline,
  IoNotificationsOutline,
  IoChatbubblesOutline,
  IoCallOutline,
  IoDiamondOutline
} from "solid-icons/io";
import { IoCall } from "react-icons/io5";
import { GoHomeFill } from "react-icons/go";



export default function Sidebar() {
  return (
    <aside class="hidden lg:flex flex-col w-72 h-screen fixed top-0 left-0 border-r border-gray-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl z-[60] shrink-0">
      <div class="p-6">
        <div class="flex flex-col">
          <h1 class="text-3xl font-black tracking-tighter bg-gradient-to-b from-[#010b80] to-[#4189DD] bg-clip-text text-transparent animate-in fade-in zoom-in duration-700">
            Lirld.com
          </h1>
          <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500">Always feel connected</span>
        </div>
      </div>
      <nav class="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        <A
          href="/"
          activeClass="bg-[#DDEDFF] dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800/50  text-[#010b80]"
          inactiveClass="hover:bg-[#DDEDFF] dark:hover:bg-zinc-800/50 text-gray-600 dark:text-zinc-400"
          end
          class="flex items-center gap-4 px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all"
        >
          <IoSearchOutline class="w-6 h-6" />
          Discover
        </A>
        <A
          href="/chats"
          activeClass="bg-white dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800/50 shadow-sm text-pink-500"
          inactiveClass="hover:bg-gray-100 dark:hover:bg-zinc-800/50 text-gray-600 dark:text-zinc-400"
          end
          class="flex items-center gap-4 px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all"
        >
          <IoChatbubblesOutline class="w-6 h-6" />
          Chats
        </A>
        <A
          href="/call-logs"
          activeClass="bg-white dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800/50 shadow-sm text-pink-500"
          inactiveClass="hover:bg-gray-100 dark:hover:bg-zinc-800/50 text-gray-600 dark:text-zinc-400"
          end
          class="flex items-center gap-4 px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all"
        >
          <IoCallOutline class="w-6 h-6" />
          Calls
        </A>

        <A
          href="/notifications"
          activeClass="bg-white dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800/50 shadow-sm text-pink-500"
          inactiveClass="hover:bg-gray-100 dark:hover:bg-zinc-800/50 text-gray-600 dark:text-zinc-400"
          class="flex items-center gap-4 px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all"
        >
          <IoNotificationsOutline class="w-6 h-6" />
          Notifications
        </A>
      </nav>

      <div class="p-4 mt-auto">
        <div class="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink-500/[0.08] via-violet-500/[0.08] to-blue-500/[0.08] border border-pink-500/10 p-6 group transition-all duration-500 hover:border-pink-500/30">
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-[40px] group-hover:bg-pink-500/30 transition-colors" />

          <div class="relative flex flex-col gap-4">
            <div class="w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-pink-500/20 shadow-sm">
              <IoDiamondOutline class="w-5 h-5 text-pink-500" />
            </div>

            <div class="space-y-1">
              <h3 class="font-bold text-gray-900 dark:text-white">Upgrade to Pro</h3>
              <p class="text-[13px] leading-relaxed text-gray-500 dark:text-zinc-400 font-medium">
                Get unlimited messages & see who's viewing you.
              </p>
            </div>

            <button class="w-full py-3.5 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-2xl text-[13px] font-bold shadow-xl shadow-pink-500/20 hover:shadow-pink-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all">
              Unlock Everything
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
