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

  const handlePointerDown = (e: PointerEvent) => {
    if (sent() || sendingChat()) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!sliderRef || sent() || sendingChat() || !e.buttons) return;
    const rect = sliderRef.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setDragProgress(progress);

    if (progress > 90 && !isSwiped()) {
      setIsSwiped(true);
      setDragProgress(100);
      handleHi(new Event('click') as any);
      haptic.trigger(50);
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isSwiped()) {
      setDragProgress(0);
    }
  };

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
      class={`group relative w-full bg-white dark:bg-[#0d0d12] border border-gray-200/50 dark:border-zinc-800/50 rounded-[2.5rem] p-3.5 flex flex-col transition-all duration-500 ${palette().glow} hover:-translate-y-1.5 select-none overflow-hidden shadow-xl shadow-black/5 gap-4`}
    >
      {/* Dynamic BG Mesh Gradient - Very Subtle */}
      <div class={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${palette().gradient} opacity-[0.05] dark:opacity-[0.1] blur-[80px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110`} />
      <div class={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-${palette().name}-50/10 dark:to-${palette().name}-950/10 pointer-events-none`} />

      {/* 1. Main Identity Section */}
      <div class="flex gap-4 items-start relative z-10">
        {/* Photo with advanced status ring */}
        <div class="relative shrink-0">
          <div class={`p-1 rounded-[1.75rem] bg-gradient-to-br ${palette().gradient} shadow-lg shadow-${palette().name}-500/10`}>
            <div class="w-24 h-24 rounded-[1.5rem] overflow-hidden bg-slate-100 dark:bg-black border border-white/20">
              <A href={`?profileModal=${props.profile.user_id}`} class="block w-full h-full">
                <Show when={photo()} fallback={
                  <div class="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-zinc-900 text-slate-400 dark:text-zinc-700">
                    <IoPerson size={36} />
                  </div>
                }>
                  <img
                    src={photo() || ''}
                    alt={props.profile.name}
                    class="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:rotate-1"
                    loading="lazy"
                    style={{ "view-transition-name": `profile-${props.profile.user_id}` }}
                  />
                </Show>
              </A>
            </div>
          </div>

          {/* Online status integrated with photo */}
          <Show when={props.profile.isOnline}>
            <div class="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white dark:bg-zinc-950 border-2 border-white dark:border-zinc-900 shadow-sm">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
          </Show>
        </div>

        {/* Name & Primary Badges */}
        <div class="flex-1 min-w-0 flex flex-col gap-1.5 pt-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-2xl font-black tracking-tighter text-gray-900 dark:text-white truncate">
              {props.profile.name}
            </h3>
            <Show when={props.profile.vip}>
              <div class="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-[0.1em] border border-amber-200 dark:border-amber-500/30">
                VIP
              </div>
            </Show>
          </div>

          {/* Spec Badges Row */}
          <div class="flex flex-wrap gap-1.5">
            <Show when={props.profile.gender}>
              <div class={`
                flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider
                ${props.profile.gender?.toLowerCase() === 'female'
                  ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-500 dark:text-rose-400'
                  : props.profile.gender?.toLowerCase() === 'male'
                    ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-500 dark:text-blue-400'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'
                }
              `}>
                <Show when={props.profile.gender?.toLowerCase() === "male"} fallback={
                  <Show when={props.profile.gender?.toLowerCase() === "female"} fallback={<IoPerson size={10} />}>
                    <IoFemale size={10} />
                  </Show>
                }>
                  <IoMale size={10} />
                </Show>
                {props.profile.gender}
              </div>
            </Show>

            {/* <Show when={props.profile.age}>
              <div class="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-full text-[10px] font-black text-slate-500 dark:text-white/60 uppercase tracking-widest">
                {props.profile.age} YRS
              </div>
            </Show> */}
          </div>

          <div class="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <IoGlobe size={11} class={palette().accent} />
            <span class="text-[10px] font-bold tracking-wider uppercase truncate">
              {props.profile.country || 'GLOBAL NETWORK'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Insight Grid */}
      <div class="grid grid-cols-2 gap-2 relative z-10 px-1">
        <div class="bg-slate-50 dark:bg-white/5 rounded-[1.25rem] p-3 border border-slate-100 dark:border-white/5 shadow-inner">
          <div class="text-[8px] font-black text-slate-400 dark:text-zinc-200 uppercase tracking-widest mb-1">VIBE MATCH</div>
          <div class="flex items-end gap-1.5">
            <span class={`text-xl font-black leading-none ${palette().text}`}>{engagement().sync}%</span>
            <span class="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase mb-0.5">Score</span>
          </div>
        </div>
        <div class="bg-slate-50 dark:bg-white/5 rounded-[1.25rem] p-3 border border-slate-100 dark:border-white/5 shadow-inner">
          <div class="text-[8px] font-black text-gray-800 dark:text-zinc-200 uppercase tracking-widest mb-1">REPLY TIME</div>
          <div class="flex items-end">
            <span class="text-[11px] font-black text-gray-900 dark:text-white leading-none whitespace-nowrap">{engagement().response}</span>
          </div>
        </div>
      </div>

      {/* 3. Bio & Vibe Section */}
      <div class="px-1 relative z-10 flex-1 flex flex-col gap-2.5">
        <div class="flex items-center gap-2 scrollbar-hide">
          <div class={`shrink-0 px-2 py-0.5 rounded bg-${palette().name}-500/10 border border-${palette().name}-500/20 text-[9px] font-black uppercase text-${palette().name}-500`}>
            # {engagement().vibe}
          </div>
          <div class="shrink-0 px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[9px] font-black uppercase text-slate-400">
            {props.profile.isOnline ? 'SIGNAL HIGH' : 'SIGNAL LOW'}
          </div>
        </div>

        <p class="text-[13px] text-gray-800 dark:text-slate-200 font-medium leading-relaxed italic opacity-90 line-clamp-2">
          {props.profile.bio || 'Hi there, I am using Lirld'}
        </p>

      </div>

      {/* 3. Action Logic */}
      <div class="relative z-10 h-11">
        <Show when={props.isMessaged || sent() || isSwiped()} fallback={
          <div
            ref={sliderRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            class="relative w-full h-full rounded-2xl border overflow-hidden transition-all duration-300 touch-none flex items-center bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
          >
            {/* Progress Fill */}
            <div
              class={`absolute inset-y-0 left-0 bg-gradient-to-r ${palette().gradient} opacity-20 transition-all duration-100`}
              style={{ width: `${dragProgress()}%` }}
            />

            {/* Slider Content */}
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Show when={sendingChat()} fallback={
                <div class="flex items-center gap-2">
                  <span class={`text-[10px] font-black uppercase tracking-[0.2em] transition-opacity duration-300 ${dragProgress() > 50 ? 'opacity-0' : 'opacity-40 text-slate-900 dark:text-white'}`}>
                    Slide to Chat
                  </span>
                  <div class={`w-1 h-1 rounded-full bg-slate-400 dark:bg-white/40 animate-pulse ${dragProgress() > 30 ? 'hidden' : ''}`} />
                </div>
              }>
                <CgSpinner class="animate-spin text-slate-400" size={18} />
              </Show>
            </div>

            {/* Draggable Puck */}
            <div
              class={`absolute top-1 left-1 bottom-1 aspect-square bg-white dark:bg-zinc-100 rounded-xl flex items-center justify-center transition-transform duration-100 shadow-xl shadow-black/10 z-20`}
              style={{ transform: `translateX(${((dragProgress() / 100) * ((sliderRef?.clientWidth || 0) - 42))}px)` }}
            >
              <IoChatbubbleEllipses size={16} class={palette().accent} />
            </div>
          </div>
        }>
          <div
            class={`w-full h-full rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.25em] border bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400`}
          >
            <IoScan size={16} class="animate-pulse" />
            <span>Message Sent</span>
          </div>
        </Show>
      </div>

      <BalanceErrorModal
        isOpen={showBalanceError()}
        message={balanceErrorMessage()}
        pricePerMinute={props.profile.pricePerMinute}
        onClose={() => setShowBalanceError(false)}
      />
    </div>
  );
}
