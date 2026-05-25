import { Show } from "solid-js";

interface CallControlsProps {
  isMuted: boolean;
  isCameraEnabled: boolean;
  isCameraLoading?: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
  isEnding: boolean;
}

export default function CallControls(props: CallControlsProps) {
  // Mic Icon
  const MicIcon = () => (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );

  // Mic Off Icon
  const MicOffIcon = () => (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  );

  // Camera Icon
  const CameraIcon = () => (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );

  // Camera Off Icon
  const CameraOffIcon = () => (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
    </svg>
  );

  // Phone Icon
  const PhoneIcon = () => (
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
    </svg>
  );

  // Loading Spinner
  const LoadingSpinner = () => (
    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div class="absolute bottom-6 sm:bottom-8 left-0 right-0 flex items-center justify-center gap-3 sm:gap-4 px-3 sm:px-4">
      <div class="bg-black/60 backdrop-blur-md rounded-full px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 border border-white/10">
        {/* Mute Button */}
        <button
          onClick={props.onToggleMute}
          class={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
            props.isMuted
              ? 'bg-red-500/90 hover:bg-red-500'
              : 'bg-white/10 hover:bg-white/20'
          } border border-white/20 text-white active:scale-95 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
          aria-label={props.isMuted ? 'Unmute' : 'Mute'}
          title={props.isMuted ? 'Unmute' : 'Mute'}
        >
          <Show when={props.isMuted} fallback={<MicIcon />}>
            <MicOffIcon />
          </Show>
        </button>
        
        {/* Camera Button */}
        <button
          onClick={props.onToggleCamera}
          disabled={props.isCameraLoading}
          class={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
            props.isCameraEnabled
              ? 'bg-white/10 hover:bg-white/20'
              : 'bg-red-500/90 hover:bg-red-500'
          } border border-white/20 text-white active:scale-95 touch-manipulation disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
          aria-label={props.isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
          title={props.isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          <Show when={props.isCameraLoading} fallback={
            <Show when={props.isCameraEnabled} fallback={<CameraOffIcon />}>
              <CameraIcon />
            </Show>
          }>
            <LoadingSpinner />
          </Show>
        </button>
        
        {/* End Call Button */}
        <button
          onClick={props.onEndCall}
          disabled={props.isEnding}
          class="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-red-500/90 hover:bg-red-500 border border-red-400/20 text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="End call"
          title="End call"
        >
          <PhoneIcon />
        </button>
      </div>
    </div>
  );
}
