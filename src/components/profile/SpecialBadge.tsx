import { Show } from "solid-js";
import { BiRegularCode } from 'solid-icons/bi';

interface SpecialBadgeProps {
    text?: string;
    className?: string; // Allow custom classes for positioning/sizing if needed
}

export default function SpecialBadge(props: SpecialBadgeProps) {
    return (
        <Show when={props.text}>
            <div class={`relative group overflow-hidden rounded-[2.5rem] p-1 ${props.className}`}>
                {/* Animated Gradient Border/Background */}
                <div class="absolute inset-0 bg-gradient-to-tr from-fuchsia-500 via-violet-500 to-cyan-500 animate-[spin_4s_linear_infinite] opacity-75 blur-xl group-hover:opacity-100 transition-opacity" />

                {/* Inner Content Container */}
                <div class="relative bg-white/90 dark:bg-black/90 backdrop-blur-3xl rounded-[2.3rem] px-8 py-10 flex flex-col items-center justify-center text-center overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl">

                    {/* Animated Corner Elements */}
                    <div class="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-fuchsia-500/30 to-transparent blur-xl animate-pulse" />
                    <div class="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-cyan-500/30 to-transparent blur-xl animate-pulse delay-700" />

                    {/* Floating Particles/Stars (Simplified CSS circles) */}
                    <div class="absolute top-4 right-6 w-2 h-2 bg-slate-900/20 dark:bg-white rounded-full animate-ping opacity-20" />
                    <div class="absolute bottom-6 left-8 w-1.5 h-1.5 bg-fuchsia-600 dark:bg-fuchsia-400 rounded-full animate-pulse opacity-40" />

                    {/* Label */}
                    <div class="relative z-10 text-[10px] font-black tracking-[0.4em] text-fuchsia-600 dark:text-fuchsia-300 uppercase mb-3 drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]">
                        SPECIAL STATUS
                    </div>

                    {/* Badge Text */}
                    <div class="relative z-10 text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-600 dark:from-fuchsia-200 dark:via-white dark:to-cyan-200 tracking-tight drop-shadow-sm">
                        {props.text}
                    </div>

                    {/* Shine Effect */}
                    <div class="absolute inset-0 -translate-x-[150%] skew-x-12 bg-gradient-to-r from-transparent via-black/5 dark:via-white/10 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
                </div>
            </div>
        </Show>
    );
}
