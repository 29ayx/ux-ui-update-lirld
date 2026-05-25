import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { RiDesignEditBoxLine } from 'solid-icons/ri'
import { AiFillSetting, AiFillDollarCircle, AiOutlineHeatMap } from 'solid-icons/ai'

interface ProfileHeaderProps {
  isAdmin?: boolean;
  isHost?: boolean;
  showActions?: boolean;
  title?: string;
}

export default function ProfileHeader(props: ProfileHeaderProps) {
  return (
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-zinc-800/50">
      <div class="px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight shrink-0">
          {props.title || "My Profile"}
        </h1>
        <div class="flex flex-1 items-center justify-end gap-3">
          <Show when={props.showActions}>
            <div class="flex items-center gap-2">

              <Show when={props.isHost}>
                <A
                  href="/host/settings"
                  class="p-2 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                  title="Host Dashboard"
                >
                  <AiFillDollarCircle class="w-5 h-5" />
                </A>
              </Show>
              <A
                href="/settings"
                class="p-2 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                title="Settings"
              >
                <AiFillSetting class="w-5 h-5" />
              </A>
              <A
                href="/profile/edit"
                class="p-2 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                title="Edit Profile"
              >
                <RiDesignEditBoxLine class="w-5 h-5" />
              </A>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
