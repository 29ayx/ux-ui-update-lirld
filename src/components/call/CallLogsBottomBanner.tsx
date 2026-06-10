import { HiSolidPhone } from 'solid-icons/hi';
import {
  HiSolidSpeakerWave
} from "solid-icons/hi";
import { AiOutlineHeart,AiOutlineGlobal } from 'solid-icons/ai'
import { BsShieldCheck } from 'solid-icons/bs'
export default function CallLogsBottomBanner() {
  const features = [
  {
    title: 'High Quality',
    description: 'Crystal clear voice calls',
    icon: HiSolidSpeakerWave,
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    title: 'Safe & Secure',
    description: 'Your privacy is our priority',
    icon: BsShieldCheck,
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    title: '100% Free',
    description: 'Call anyone for free',
    icon: AiOutlineHeart,
    color: 'text-pink-500',
    bg: 'bg-pink-100 dark:bg-pink-900/30',
  },
  {
    title: 'Global Reach',
    description: 'Connect with people worldwide',
    icon: AiOutlineGlobal,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
];

  return (
    <div class="mt-8 bg-transparent dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div class="grid grid-cols-1 lg:grid-cols-5">
        {/* Left Section */}
        <div class="lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <HiSolidPhone class="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>

            <div>
              <h3 class="font-semibold text-lg text-slate-900 dark:text-white">
                Make meaningful connections
              </h3>

              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Calls help you build real conversations and stronger
                connections.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div class="lg:col-span-3 grid grid-cols-2 md:grid-cols-4">
          {features.map((feature) => (
            <div class="p-5 flex flex-row items-start gap-2">
              <div
  class={`w-10 h-10 rounded-full flex items-center justify-center ${feature.bg}`}
>
  <feature.icon class={`w-8 h-5 ${feature.color}`} />
</div>
<div>

              <h4 class="font-medium text-slate-900 dark:text-white">
                {feature.title}
              </h4>

              <p class="text-xs text-slate-500 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}