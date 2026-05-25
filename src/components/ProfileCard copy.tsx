import { Show, createSignal, createMemo } from "solid-js";
import { useAuth } from "~/lib/auth";
import { getOrCreateChat, sendMessage } from "~/lib/chat";
import { initiateCall } from "~/lib/calls";
import { checkMicrophonePermission } from "~/lib/permissions";
import { IoMale, IoFemale, IoPerson, IoFlash, IoScan, IoCall, IoChatbubbleEllipses, IoGlobe, IoTime } from 'solid-icons/io';
import { CgSpinner } from "solid-icons/cg";
import { A } from "@solidjs/router";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import BalanceErrorModal from "~/components/BalanceErrorModal";

import { UserProfileWithOnlineStatus } from "~/lib/users";

interface ProfileCardProps {
  profile: UserProfileWithOnlineStatus;
  onMessageSent?: (userId: string) => void;
  onCallInitiated?: (userId: string) => void;
  hidePricing?: boolean;
}

export default function ProfileCard(props: ProfileCardProps) {
  const { user } = useAuth();
  const haptic = useHapticFeedback();
  const [sendingChat, setSendingChat] = createSignal(false);
  const [sendingCall, setSendingCall] = createSignal(false);
  const [sent, setSent] = createSignal(false);
  const [isActive, setIsActive] = createSignal(false);
  const [showBalanceError, setShowBalanceError] = createSignal(false);
  const [balanceErrorMessage, setBalanceErrorMessage] = createSignal("");

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

  const handleCall = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user() || sendingCall() || sendingChat()) return;

    haptic.trigger(30);
    setSendingCall(true);
    try {
      // Check microphone permission first
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) {
        setSendingCall(false);
        return;
      }

      await initiateCall(user()!.uid, props.profile.user_id, 'profile');
      props.onCallInitiated?.(props.profile.user_id);
    } catch (err) {
      console.error('Failed to initiate call:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate call. Please try again.';

      // Check if it's a balance error
      if (errorMessage.includes('Insufficient credits') || errorMessage.includes('credits')) {
        setBalanceErrorMessage(errorMessage);
        setShowBalanceError(true);
      } else {
        alert(errorMessage);
      }
    } finally {
      setSendingCall(false);
    }
  };

  const handleHi = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if already sending or sent
    if (sendingChat() || sendingCall() || sent()) return;

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

  return (
    <div
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      class="group relative w-full h-auto bg-slate-900 border border-slate-800 rounded-[2rem] p-3 flex flex-col gap-3 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 select-none overflow-hidden"
    >
      {/* Decorative Corner Accents (Geometric) */}
      <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-800/50 to-transparent rounded-tr-[2rem] pointer-events-none" />
      <div class="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-slate-800/50 to-transparent rounded-bl-[2rem] pointer-events-none" />

      {/* 1. Image Viewport (Geometric Container) */}
      <div class="relative w-full aspect-[4/3.5] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
        <A href={`?profileModal=${props.profile.user_id}`} class="block w-full h-full">
          <Show when={photo()} fallback={<div class="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-800"><IoPerson size={48} /></div>}>
            <img
              src={photo() || ''}
              alt={props.profile.name}
              class="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
              loading="lazy"
              decoding="async"
              style={{ "view-transition-name": `profile-${props.profile.user_id}` }}
            />
          </Show>

          {/* Viewport Overlay Effects */}
          <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/40 pointer-events-none" />
          <div class="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-3xl pointer-events-none" />

          {/* Status Indicator (Integrated into viewport) */}
          <Show when={props.profile.isOnline}>
            <div class="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/30">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="text-[9px] font-black tracking-widest text-emerald-400 uppercase">ONLINE</span>
            </div>
          </Show>
        </A>
      </div>

      {/* 2. Data Grid (Geometric Info) */}
      <div class="flex flex-col gap-3 px-1">

        {/* Header: Name & Gender */}
        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <span class="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase mb-0.5">IDENTITY</span>
            <h3 class="text-xl font-black italic tracking-tight text-white leading-none">
              {props.profile.name}
            </h3>
          </div>

          <Show when={props.profile.gender}>
            <div class={`
                    flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider
                    ${props.profile.gender.toLowerCase() === 'female' ? 'bg-pink-950/30 border-pink-500/20 text-pink-400' :
                props.profile.gender.toLowerCase() === 'male' ? 'bg-blue-950/30 border-blue-500/20 text-blue-400' :
                  'bg-purple-950/30 border-purple-500/20 text-purple-400'}
                 `}>
              <Show when={props.profile.gender.toLowerCase() === "male"} fallback={
                <Show when={props.profile.gender.toLowerCase() === "female"} fallback={<IoPerson size={10} />}>
                  <IoFemale size={10} />
                </Show>
              }>
                <IoMale size={10} />
              </Show>
              <span>{props.profile.gender}</span>
            </div>
          </Show>
        </div>

        {/* Specs: Age & Location */}
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-slate-800/50 rounded-xl p-2.5 border border-slate-800 flex flex-col gap-1 hover:bg-slate-800 transition-colors">
            <div class="flex items-center gap-1.5 text-slate-400">
              <IoTime size={10} />
              <span class="text-[8px] font-black tracking-[0.2em] uppercase">LEVEL</span>
            </div>
            <span class="text-xs font-bold text-slate-200">
              {props.profile.age ? `${props.profile.age} YRS` : 'N/A'}
            </span>
          </div>

          <div class="bg-slate-800/50 rounded-xl p-2.5 border border-slate-800 flex flex-col gap-1 hover:bg-slate-800 transition-colors">
            <div class="flex items-center gap-1.5 text-slate-400">
              <IoGlobe size={10} />
              <span class="text-[8px] font-black tracking-[0.2em] uppercase">SECTOR</span>
            </div>
            <span class="text-xs font-bold text-slate-200 truncate">
              {props.profile.country || 'UNKNOWN'}
            </span>
          </div>
        </div>

        {/* Pricing / Bio (Condensed) */}
        <Show when={shouldShowCallButton() && props.profile.pricePerMinute} fallback={
          <div class="px-2 py-1">
            <p class="text-[10px] text-slate-400 line-clamp-2 italic leading-relaxed opacity-80">
              "{props.profile.bio || 'No bio available.'}"
            </p>
          </div>
        }>
          <div class="flex items-center justify-between bg-indigo-950/20 rounded-xl px-3 py-2 border border-indigo-500/20">
            <div class="flex items-center gap-2">
              <div class="p-1 rounded bg-indigo-500/20 text-indigo-400">
                <IoFlash size={10} />
              </div>
              <span class="text-[9px] font-black tracking-[0.1em] text-indigo-300 uppercase">SYNC RATE</span>
            </div>
            <span class="text-sm font-black text-white tracking-tight">
              ${props.profile.pricePerMinute?.toFixed(2)}<span class="text-[9px] text-slate-400 font-normal ml-0.5">/min</span>
            </span>
          </div>
        </Show>

      </div>

      {/* 3. Action Matrix (Buttons) */}
      <div class="grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={handleHi}
          disabled={sendingChat() || sendingCall() || sent()}
          class={`
                h-10 rounded-xl flex items-center justify-center gap-2
                font-bold text-[10px] uppercase tracking-[0.15em]
                transition-all duration-200 border
                ${sent() ?
              'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
              'bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-slate-600 text-white'
            }
            `}
        >
          <Show when={sent()} fallback={
            <Show when={sendingChat()} fallback={
              <>
                <IoChatbubbleEllipses size={14} class="opacity-80" />
                <span>LINK</span>
              </>
            }>
              <CgSpinner class="animate-spin" size={14} />
            </Show>
          }>
            <IoScan size={14} />
            <span>SENT</span>
          </Show>
        </button>

        <button
          onClick={handleCall}
          disabled={sendingCall() || !shouldShowCallButton()}
          class={`
                h-10 rounded-xl flex items-center justify-center gap-2
                font-bold text-[10px] uppercase tracking-[0.15em]
                transition-all duration-200 border
                ${shouldShowCallButton() ?
              'bg-slate-100 hover:bg-white border-white text-slate-900 shadow-lg shadow-white/5' :
              'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
            }
            `}
        >
          <Show when={sendingCall()} fallback={
            <>
              <IoCall size={14} class={shouldShowCallButton() ? "text-indigo-600" : ""} />
              <span>VOICE</span>
            </>
          }>
            <CgSpinner class="animate-spin" size={14} />
          </Show>
        </button>
      </div>

      {/* Balance Error Modal */}
      <BalanceErrorModal
        isOpen={showBalanceError()}
        message={balanceErrorMessage()}
        pricePerMinute={props.profile.pricePerMinute}
        onClose={() => setShowBalanceError(false)}
      />
    </div>
  );
}
