import { Show } from "solid-js";
import type { BirthdayInfo } from "~/lib/profile/birthdayHelpers";
import { FaSolidCalendarDays } from 'solid-icons/fa'


interface ProfileBirthdayProps {
  birthdayInfo: BirthdayInfo | null;
  showDaysToBirthday?: boolean;
  showBirthdayCard?: boolean;
}

export default function ProfileBirthday(props: ProfileBirthdayProps) {
  return (
    <Show when={props.birthdayInfo && props.showDaysToBirthday !== false && props.showBirthdayCard !== false}>
      {/* Birthday Card - Gradient highlight for special info */}
      <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-7 border border-purple-500/30 shadow-xl mt-4 sm:mt-5 md:mt-6 lg:mt-8">
        {/* Section Header - Icon container for consistency */}
        <div class="flex items-center gap-2 sm:gap-2.5 md:gap-3 mb-3 sm:mb-4 md:mb-5">
          <div class="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-purple-500/50 flex items-center text-white justify-center flex-shrink-0">
          <FaSolidCalendarDays class="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
          </div>
          <h3 class="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white">Birthday</h3>
        </div>
        
        {/* Birthday Info - Visual Hierarchy: Date > Countdown */}
        <div class="space-y-1.5 sm:space-y-2 md:space-y-2.5">
          <Show when={props.birthdayInfo}>
            {(info) => (
              <>
                <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                  {info().month} {info().day}
                </p>
                <Show when={info().daysUntil > 0}>
                   <div class="p-1.5 sm:p-2 md:p-2.5 bg-yellow-500 rounded-md">
                  <p class="text-xs sm:text-sm md:text-base lg:text-lg text-black font-medium">
                    {info().daysUntil} {info().daysUntil === 1 ? "day" : "days"} away 🎉
                  </p>
                  </div>
                </Show>
                <Show when={info().daysUntil === 0}>
                  <p class="text-xs sm:text-sm md:text-base lg:text-lg text-purple-200/90 font-bold animate-pulse">
                    🎂 Today! Happy Birthday! 🎉
                  </p>
                </Show>
              </>
            )}
          </Show>
        </div>
      </div>
    </Show>
  );
}
