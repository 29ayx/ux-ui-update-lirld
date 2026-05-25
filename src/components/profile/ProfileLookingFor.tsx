import { Show, For } from "solid-js";
import { FaSolidClover } from 'solid-icons/fa'


interface ProfileLookingForProps {
  lookingFor?: string[];
}

export default function ProfileLookingFor(props: ProfileLookingForProps) {
  return (
    <Show when={(() => {
      const lookingFor = props.lookingFor;
      return lookingFor && Array.isArray(lookingFor) && lookingFor.length > 0;
    })()}>
      {/* Progressive Disclosure - Secondary info card */}
      <div class="bg-none rounded-xl sm:rounded-2xl md:rounded-3xl">
        {/* Section Header - Visual Hierarchy */}
        <div class="flex items-center gap-2 sm:gap-2.5 md:gap-3 mb-3 sm:mb-4 md:mb-5">
          <div class="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <FaSolidClover class="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
          </div>
          <h3 class="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-black dark:text-white">Looking For</h3>
        </div>
        
        {/* Tags - 8dp grid spacing, min 36dp height */}
        <div class="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
          <For each={props.lookingFor || []}>
            {(item) => (
              <div class="bg-white/50 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-full border border-white/10 min-h-[32px] sm:min-h-[36px] md:min-h-[40px] lg:min-h-[44px] flex items-center touch-manipulation hover:bg-white/15 active:scale-[0.98] transition-all duration-200">
                <span class="text-xs sm:text-sm md:text-base lg:text-lg text-black dark:text-white font-medium">{item}</span>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}
