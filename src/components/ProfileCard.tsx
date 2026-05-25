import { Show, createSignal, createMemo } from "solid-js";
import { useAuth } from "~/lib/auth";
import { getOrCreateChat, sendMessage } from "~/lib/chat";
import { initiateCall } from "~/lib/calls";
import { checkMicrophonePermission } from "~/lib/permissions";
import { IoMale, IoFemale, IoPerson, IoFlash, IoScan, IoCall, IoChatbubbleEllipses, IoGlobe, IoTime, IoGift, IoCheckmark, IoEyeOff } from 'solid-icons/io';
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { MdRoundWaving_hand } from 'solid-icons/md'
countries.registerLocale(enLocale);
import { CgSpinner } from "solid-icons/cg";
import { A } from "@solidjs/router";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import BalanceErrorModal from "~/components/BalanceErrorModal";
import { openProfile } from "~/lib/profileStore";

import { UserProfileWithOnlineStatus } from "~/lib/users";

interface ProfileCardProps {
  profile: UserProfileWithOnlineStatus;
  onMessageSent?: (userId: string) => void;
  onCallInitiated?: (userId: string) => void;
  hidePricing?: boolean;
  isMessaged?: boolean;
}

export default function ProfileCard(props: ProfileCardProps) {
  const { user } = useAuth();
  const haptic = useHapticFeedback();
  const [sendingChat, setSendingChat] = createSignal(false);
  const [sent, setSent] = createSignal(false);
  const [isActive, setIsActive] = createSignal(false);
  const [showBalanceError, setShowBalanceError] = createSignal(false);
  const [balanceErrorMessage, setBalanceErrorMessage] = createSignal("");
  const [dragProgress, setDragProgress] = createSignal(0);
  const [isSwiped, setIsSwiped] = createSignal(false);
  let sliderRef: HTMLDivElement | undefined;

  // Country flag helpers using i18n-iso-countries
  const getIsoCode = (label: string): string | null => {
    if (!label) return null;
    // Already a 2-letter ISO code
    if (label.length === 2) return label.toUpperCase();
    return countries.getAlpha2Code(label, "en") ?? null;
  };

  const codeToFlag = (code: string) => {
    const upper = code.toUpperCase();
    return String.fromCodePoint(127397 + upper.charCodeAt(0)) +
      String.fromCodePoint(127397 + upper.charCodeAt(1));
  };

  const countryFlag = createMemo(() => {
    const label = props.profile.country;
    if (!label) return null;
    const code = getIsoCode(label);
    if (!code) return null;
    return codeToFlag(code);
  });

  // Dynamic Palette System based on User ID
  const palette = createMemo(() => {
    const palettes = [
      { name: 'emerald', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', accent: 'text-emerald-500', glow: 'hover:shadow-emerald-500/10', gradient: 'from-emerald-500 to-teal-600' },
      { name: 'amber', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', accent: 'text-amber-500', glow: 'hover:shadow-amber-500/10', gradient: 'from-amber-500 to-orange-600' },
      { name: 'indigo', text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/30', accent: 'text-indigo-500', glow: 'hover:shadow-indigo-500/10', gradient: 'from-indigo-500 to-blue-600' },
      { name: 'violet', text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-200 dark:border-violet-500/30', accent: 'text-violet-500', glow: 'hover:shadow-violet-500/10', gradient: 'from-violet-500 to-fuchsia-600' },
      { name: 'rose', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/30', accent: 'text-rose-500', glow: 'hover:shadow-rose-500/10', gradient: 'from-rose-500 to-pink-600' }
    ];
    const index = Math.abs(props.profile.user_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % palettes.length;
    return palettes[index];
  });

  // Use the new photos array format (Cloudinary)
  const photo = () => {
    const photos = props.profile.photos;
    if (Array.isArray(photos) && photos.length > 0) {
      return photos[0];
    }
    return props.profile.photoURL || null;
  };

  const shouldShowCallButton = createMemo(() => {
    if (props.hidePricing || props.profile.hidePrice) return false;
    if (user()?.uid === props.profile.user_id) return false;
    return props.profile.isHost === true && typeof props.profile.pricePerMinute === 'number';
  });

  const handleHi = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if already sending or sent
    if (sendingChat() || sent()) return;

    // If no user, call the callback (parent can handle login prompt) and return
    if (!user()) {
      props.onMessageSent?.(props.profile.user_id);
      return;
    }

    // Trigger haptic feedback (30ms)
    haptic.trigger(30);
    setSendingChat(true);

    try {
      const chatId = await getOrCreateChat(user()!.uid, props.profile.user_id);
      await sendMessage(chatId, user()!.uid, "Hello");
      setSendingChat(false);
      setSent(true);

      // Delay the callback so the user sees the "Message Sent" badge
      setTimeout(() => {
        props.onMessageSent?.(props.profile.user_id);
      }, 1000);
    } catch (err) {
      console.error(err);
      setSendingChat(false);
    }
  };

  const handlePointerDown = (e: PointerEvent) => { };
  const handlePointerMove = (e: PointerEvent) => { };
  const handlePointerUp = (e: PointerEvent) => { };

  const navigateToChat = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user()) return;
    const [u1, u2] = [user()!.uid, props.profile.user_id].sort();
    const chatId = `${u1}_${u2}`;
    window.location.href = `/chats/${chatId}`;
  };

  // Creative Engagement Metrics
  const engagement = createMemo(() => {
    const seed = props.profile.user_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sync = 80 + (seed % 19); // 80-99% match
    const response = ['⚡ INSTANT', '💨 FAST', '🧘 STEADY'][seed % 3];
    const vibes = ['CHILL', 'ADVENTUROUS', 'CREATIVE', 'INTELLECTUAL', 'ENERGETIC', 'MYSTERIOUS'];
    const vibe = vibes[seed % vibes.length];
    return { sync, response, vibe };
  });

  return (
    <div
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      class={`group relative w-full bg-white dark:bg-[#0d0d12] border border-gray-200/50 dark:border-zinc-800/50 rounded-xl p-3.5 lg:p-5 flex flex-col transition-all duration-500 ${palette().glow} hover:-translate-y-1.5 select-none overflow-hidden shadow-xl shadow-black/5 gap-4 lg:gap-5`}
    >
      {/* Dynamic BG Mesh Gradient - Very Subtle */}
      <div class={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${palette().gradient} opacity-[0.05] dark:opacity-[0.1] blur-[80px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110`} />
      <div class={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-${palette().name}-50/10 dark:to-${palette().name}-950/10 pointer-events-none`} />

      {/* Gift Action - Hidden for now */}
      <Show when={false}>
        <div class="absolute top-4 right-4 z-20">
          <A
            href="/vault"
            onClick={(e) => {
              e.stopPropagation();
              haptic.trigger(30);
            }}
            class="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 text-amber-500 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg"
          >
            <IoGift size={16} />
          </A>
        </div>
      </Show>

      {/* 1. Main Identity Section */}
      <div class="flex items-center justify-between w-full">
        {/* Left side */}
        <div class="flex items-center gap-3 lg:gap-4">
          {/* Avatar */}
          <div 
            onClick={() => openProfile(props.profile.user_id)}
            class="cursor-pointer active:scale-95 transition-transform"
          >
            <div class="relative">
              <div class="w-14 h-14 lg:w-20 lg:h-20 rounded-full overflow-hidden bg-slate-200">
                <img
                  src={photo() || ""}
                  class="w-full h-full object-cover"
                />

              </div>

              {/* Online dot */}
              <Show when={props.profile.isOnline}>
                <div class="absolute bottom-0 right-0 w-3.5 h-3.5 lg:w-4 lg:h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </Show>
            </div>
          </div>

          {/* Info */}
          <div class="flex flex-col leading-tight gap-1 lg:gap-2">
            {/* Name */}
            <div class="flex items-center gap-1">
              <span class="font-semibold text-base lg:text-xl text-gray-900 dark:text-gray-100">
                {props.profile.name}
              </span>
            </div>
            {/* Age + Country */}
            <div class="flex items-center gap-2 lg:gap-3">
              <Show
                when={props.profile.age}
                fallback={
                  <span class={`text-[11px] lg:text-sm px-2 lg:px-3 py-0.5 rounded-full ${palette().bg} ${palette().border} border flex items-center gap-1 ${palette().accent} opacity-50`}>
                    <IoEyeOff size={12} />
                  </span>
                }
              >
                <span class="text-[11px] lg:text-sm px-2 lg:px-3 py-0.5 rounded-full bg-pink-100 text-pink-600 font-medium">
                  {props.profile.age} yrs
                </span>
              </Show>

              <Show
                when={props.profile.country}
                fallback={
                  <span class={`text-[11px] lg:text-sm flex items-center gap-1 ${palette().accent} opacity-50`}>
                    <IoEyeOff size={13} />
                  </span>
                }
              >
                <span class="text-[11px] lg:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Show when={countryFlag()}>
                    <span>{countryFlag()}</span>
                  </Show>
                  {props.profile.country}
                </span>
              </Show>
            </div>

            {/* Bio */}
            <span class="text-[12px] lg:text-sm text-gray-500">
              Hi there, I am using Lirld
            </span>
          </div>
        </div>

        {/* Right side action */}
        <button
          onClick={(e) => {
            if (sent() || props.isMessaged) {
              navigateToChat(e as unknown as Event);
            } else {
              handleHi(e as unknown as Event);
            }
          }}
          disabled={sendingChat()}
          class={`w-11 h-11 flex items-center justify-center rounded-full border transition ${sent() || props.isMessaged
            ? "border-green-200 text-green-600 hover:bg-green-100"
            : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            }`}
        >
          <Show when={sendingChat()}>
            <CgSpinner size={18} class="animate-spin" />
          </Show>
          <Show when={!sendingChat() && (sent() || props.isMessaged)}>
            <IoCheckmark size={20} />
            <span class="sr-only">Message sent</span>
          </Show>
          <Show when={!sendingChat() && !sent() && !props.isMessaged}>
            <MdRoundWaving_hand size={20} />
          </Show>
        </button>
      </div>


      {/* 3. Action Logic */}


      <BalanceErrorModal
        isOpen={showBalanceError()}
        message={balanceErrorMessage()}
        pricePerMinute={props.profile.pricePerMinute}
        onClose={() => setShowBalanceError(false)}
      />
    </div >
  );
}
