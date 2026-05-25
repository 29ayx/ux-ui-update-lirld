import { createMemo, Show } from "solid-js";
import { UserProfileWithOnlineStatus } from "~/lib/users";
import { A } from "@solidjs/router";
import { IoGlobe, IoPerson } from "solid-icons/io";
import { openProfile } from "~/lib/profileStore";

interface MinimalProfileCardProps {
    profile: UserProfileWithOnlineStatus;
}

export default function MinimalProfileCard(props: MinimalProfileCardProps) {


    const photo = () => {
        const photos = props.profile.photos;
        if (Array.isArray(photos) && photos.length > 0) {
            return photos[0];
        }
        return props.profile.photoURL || null;
    };

    return (
        <div
            onClick={() => openProfile(props.profile.user_id)}
            class={`
        cursor-pointer group relative overflow-hidden bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-gray-100/50 dark:border-zinc-800/50 transition-all duration-500 hover:scale-105 hover:-translate-y-1 flex flex-col shadow-sm hover:shadow-2xl}
        w-52 h-40 sm:w-52 sm:h-44 md:w-76 md:h-52 lg:w-76 lg:h-52 rounded-xl sm:rounded-xl
      `}
        >
            {/* Top Half Background (Featured GIF or Default Retro-Tech) */}
            <div class="absolute top-0 left-0 w-full h-[60%] bg-zinc-900 overflow-hidden">
                {/* Featured GIF or Animated Retro Grid Background */}
                <div
                    class="absolute inset-0 opacity-80 pointer-events-none"
                    style={{
                        "background-image": `url('${(props.profile as any).featuredGif || 'https://i.pinimg.com/originals/0c/64/9a/0c649a17ec1e5f5ca340248b4ef4e4be.gif'}')`,
                        "background-size": "cover",
                        "background-position": "center"
                    }}
                />
            </div>

            {/* Profile Photo - vertically centered, left-aligned on lg */}
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-4 lg:-translate-x-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 z-20">
                <div class="absolute inset-[-2px] rounded-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-0.5 shadow-md">
                    <div class="w-full h-full rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        <Show when={photo()} fallback={
                            <div class="w-full h-full flex items-center justify-center text-zinc-400">
                                <IoPerson size={14} />
                            </div>
                        }>
                            <img
                                src={photo() || ''}
                                alt={props.profile.name}
                                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </Show>
                    </div>
                </div>

                {/* Online Status Dot */}
                <Show when={props.profile.isOnline}>
                    <div class="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-white dark:bg-zinc-900 border border-white dark:border-zinc-800 z-30">
                        <span class="relative flex h-1.5 w-1.5">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                    </div>
                </Show>
            </div>

            {/* Info Section - always in the bottom */}
            <div class="mt-auto px-2 sm:px-3 pb-4 sm:pb-6  z-10 pt-2">
                <div class="flex flex-col items-start gap-0.5 sm:gap-1">
                    <h3 class="text-xs sm:text-sm lg:text-base font-black tracking-tight text-gray-900 dark:text-white truncate max-w-[80px] sm:max-w-[100px] lg:max-w-[140px]">
                        {props.profile.name}
                    </h3>

                    <div class="flex items-center gap-0.5 text-zinc-500 dark:text-zinc-400">
                        <IoGlobe size={8} />
                        <span class="text-[7px] sm:text-[8px] lg:text-[11px] font-bold uppercase tracking-wider truncate max-w-[70px] sm:max-w-[90px] lg:max-w-[120px]">
                            {props.profile.country || 'Global'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
