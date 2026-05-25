/**
 * ProfileInfo Component - Neural Data Design
 */
import { RiFinanceVipFill } from 'solid-icons/ri'
import SpecialBadge from "./SpecialBadge";
import { Show, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "~/lib/auth";
import { getOrCreateChat, sendMessage } from "~/lib/chat";
import { initiateCall } from "~/lib/calls";
import { checkMicrophonePermission } from "~/lib/permissions";
import type { ZodiacSign } from "~/lib/profile/zodiacHelpers";
import { IoMale, IoFemale, IoPerson, IoChatbubbles, IoLocationSharp, IoLanguage, IoCalendar, IoQrCode, IoFingerPrint } from 'solid-icons/io';
import { FaSolidCheck } from 'solid-icons/fa';
import BalanceErrorModal from "~/components/BalanceErrorModal";

interface ProfileInfoProps {
  userName: string;
  userId: string;
  age: number | null;
  gender?: string;
  country?: string;
  language?: string;
  zodiac: ZodiacSign | null;
  showCustomBadge?: boolean;
  badgeText?: string;
  isHost?: boolean;
  pricePerMinute?: number;
  isOwnProfile?: boolean;
  hidePrice?: boolean;
  showAge?: boolean;
}

export default function ProfileInfo(props: ProfileInfoProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openingChat, setOpeningChat] = createSignal(false);
  const [initiatingCall, setInitiatingCall] = createSignal(false);
  const [sendingMessage, setSendingMessage] = createSignal(false);
  const [messageSent, setMessageSent] = createSignal(false);
  const [showBalanceError, setShowBalanceError] = createSignal(false);
  const [balanceErrorMessage, setBalanceErrorMessage] = createSignal("");

  const handleOpenChat = async () => {
    const currentUser = user();
    if (!currentUser || openingChat()) return;

    setOpeningChat(true);
    try {
      const chatId = await getOrCreateChat(currentUser.uid, props.userId);
      navigate(`/chats/${chatId}`);
    } catch (error) {
      console.error("Error opening chat:", error);
    } finally {
      setOpeningChat(false);
    }
  };

  const handleCall = async () => {
    const currentUser = user();
    if (!currentUser || initiatingCall()) return;

    setInitiatingCall(true);
    try {
      // Check microphone permission first
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) {
        setInitiatingCall(false);
        return;
      }

      await initiateCall(currentUser.uid, props.userId, 'profile');
    } catch (error: any) {
      console.error("Error initiating call:", error);
      const errorMessage = error.message || 'Failed to initiate call. Please try again.';

      // Check if it's a balance error
      if (errorMessage.includes('Insufficient credits') || errorMessage.includes('credits')) {
        setBalanceErrorMessage(errorMessage);
        setShowBalanceError(true);
      } else {
        // For other errors, show alert (can be replaced with another modal later)
        alert(errorMessage);
      }
    } finally {
      setInitiatingCall(false);
    }
  };

  const handleSendMessage = async () => {
    const currentUser = user();
    if (!currentUser || sendingMessage() || messageSent() || props.isOwnProfile) return;

    setSendingMessage(true);
    try {
      const chatId = await getOrCreateChat(currentUser.uid, props.userId);
      await sendMessage(chatId, currentUser.uid, "Hello");
      setMessageSent(true);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div class="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
      {/* Identity Card */}
      <div class="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl md:rounded-[2rem] p-4 sm:p-5 md:p-6 lg:p-7 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
        {/* Decorative 'Noise' Background */}
        <div class="absolute top-0 right-0 p-2 sm:p-3 md:p-4 lg:p-5 opacity-10 pointer-events-none">
          <IoFingerPrint class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 text-purple-600 dark:text-purple-400" />
        </div>

        <div class="relative z-10">
          <label class="block text-[9px] sm:text-[10px] md:text-[11px] font-black text-purple-500 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1.5 sm:mb-2 md:mb-2.5">
            User Profile
          </label>

          <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white truncate tracking-tight mb-3 sm:mb-4 md:mb-5">
            {props.userName}
          </h1>

          <div class="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
            {/* Age Chip */}
            <Show when={props.showAge !== false && props.age !== null}>
              <div class="flex items-center gap-2 sm:gap-3 md:gap-3.5 bg-violet-50 dark:bg-violet-900/20 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 lg:py-3.5 rounded-xl sm:rounded-2xl border border-violet-100 dark:border-violet-800/30">
                <div class="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <span class="font-black text-sm sm:text-base md:text-lg lg:text-xl">{props.age}</span>
                </div>
                <div>
                  <div class="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-violet-400 uppercase tracking-wider">Age</div>
                  <div class="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white">Years</div>
                </div>
              </div>
            </Show>

            {/* Gender Chip */}
            <Show when={props.gender}>
              <div class="flex items-center gap-2 sm:gap-3 md:gap-3.5 bg-pink-50 dark:bg-pink-900/20 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 lg:py-3.5 rounded-xl sm:rounded-2xl border border-pink-100 dark:border-pink-800/30">
                <div class="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <Show when={props.gender?.toLowerCase() === "male"} fallback={
                    <Show when={props.gender?.toLowerCase() === "female"} fallback={<IoPerson size={16} class="sm:w-5 sm:h-5 md:w-6 md:h-6" />}>
                      <IoFemale size={16} class="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </Show>
                  }>
                    <IoMale size={16} class="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </Show>
                </div>
                <div>
                  <div class="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-pink-400 uppercase tracking-wider">Gender</div>
                  <div class="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white capitalize">{props.gender}</div>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div class="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
        <Show when={props.country}>
          <div class="bg-emerald-50/50 dark:bg-emerald-900/10 p-3 sm:p-3.5 md:p-4 lg:p-5 rounded-xl sm:rounded-[1.25rem] md:rounded-[1.5rem] border border-emerald-100 dark:border-emerald-800/30 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-1 -top-1 sm:-right-2 sm:-top-2 md:-right-3 md:-top-3 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
              <IoLocationSharp size={40} class="sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px] lg:w-[70px] lg:h-[70px] text-emerald-600" />
            </div>
            <div class="relative z-10 text-center">
              <div class="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 mx-auto mb-1.5 sm:mb-2 md:mb-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <IoLocationSharp size={18} class="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px] lg:w-6 lg:h-6" />
              </div>
              <div class="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">Location</div>
              <div class="text-xs sm:text-sm md:text-base font-black text-slate-900 dark:text-white truncate">{props.country}</div>
            </div>
          </div>
        </Show>

        <Show when={props.language}>
          <div class="bg-blue-50/50 dark:bg-blue-900/10 p-3 sm:p-3.5 md:p-4 lg:p-5 rounded-xl sm:rounded-[1.25rem] md:rounded-[1.5rem] border border-blue-100 dark:border-blue-800/30 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-1 -top-1 sm:-right-2 sm:-top-2 md:-right-3 md:-top-3 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
              <IoLanguage size={40} class="sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px] lg:w-[70px] lg:h-[70px] text-blue-600" />
            </div>
            <div class="relative z-10 text-center">
              <div class="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 mx-auto mb-1.5 sm:mb-2 md:mb-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                <IoLanguage size={18} class="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px] lg:w-6 lg:h-6" />
              </div>
              <div class="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">Speaking</div>
              <div class="text-xs sm:text-sm md:text-base font-black text-slate-900 dark:text-white truncate">{props.language}</div>
            </div>
          </div>
        </Show>

        <Show when={props.zodiac}>
          <div class="col-span-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 sm:p-3.5 md:p-4 lg:p-5 rounded-xl sm:rounded-[1.25rem] md:rounded-[1.5rem] border border-amber-100 dark:border-amber-800/30 shadow-sm flex items-center gap-3 sm:gap-4 md:gap-5">
            <div class="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl sm:text-2xl md:text-3xl shadow-sm shrink-0">
              {props.zodiac?.emoji}
            </div>
            <div>
              <div class="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-0.5">Zodiac Sign</div>
              <div class="text-sm sm:text-base md:text-lg lg:text-xl font-black text-amber-900 dark:text-amber-100">{props.zodiac?.name}</div>
            </div>
          </div>
        </Show>
      </div>

      {/* Action Buttons */}
      <Show when={!props.isOwnProfile}>
        <div class="p-0.5 sm:p-1 md:p-1.5">
          <button
            onClick={handleSendMessage}
            disabled={sendingMessage() || messageSent()}
            class="w-full h-12 sm:h-14 md:h-16 lg:h-20 rounded-xl sm:rounded-[1.25rem] md:rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-black text-sm sm:text-base md:text-lg lg:text-xl uppercase tracking-wide transition-all duration-300 shadow-xl shadow-blue-600/30 active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 md:gap-4 transform hover:-translate-y-1"
          >
            <Show
              when={messageSent()}
              fallback={
                <>
                  <Show when={sendingMessage()} fallback={<IoChatbubbles size={18} class="sm:w-5 sm:h-5 md:w-6 md:h-6" />}>
                    <div class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-3 sm:border-4 border-current border-t-transparent rounded-full animate-spin" />
                  </Show>
                  <span>{sendingMessage() ? "Sending..." : "Send Message"}</span>
                </>
              }
            >
              <FaSolidCheck size={18} class="sm:w-5 sm:h-5 md:w-6 md:h-6" />
              <span>Message Sent</span>
            </Show>
          </button>
        </div>
      </Show>

      {/* Special Badge */}
      <SpecialBadge
        text={props.showCustomBadge && props.badgeText ? props.badgeText : undefined}
        className="mt-3 sm:mt-4 md:mt-5 lg:mt-6"
      />

      {/* Balance Error Modal */}
      <BalanceErrorModal
        isOpen={showBalanceError()}
        message={balanceErrorMessage()}
        pricePerMinute={props.pricePerMinute}
        onClose={() => setShowBalanceError(false)}
      />
    </div>
  );
}
