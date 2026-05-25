import { Show, createSignal, onMount, onCleanup } from "solid-js";

interface IncomingCallNotificationProps {
  callId: string;
  callerName: string;
  callerPhoto?: string;
  pricePerMinute?: number;
  isFree: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallNotification(props: IncomingCallNotificationProps) {
  const [isVisible, setIsVisible] = createSignal(false);
  const [isRinging, setIsRinging] = createSignal(true);
  let audioElement: HTMLAudioElement | undefined;

  // Show animation on mount
  onMount(() => {
    setTimeout(() => setIsVisible(true), 10);
    
    // Create and play ringing sound
    // Using a simple oscillator-based ring tone since we don't have audio files
    playRingingSound();
  });

  // Cleanup on unmount
  onCleanup(() => {
    stopRingingSound();
  });

  const playRingingSound = () => {
    try {
      // Create an audio context for the ringing sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440; // A4 note
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1; // Low volume
      
      // Create a pulsing effect
      let isPlaying = true;
      const pulse = () => {
        if (!isPlaying) return;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + 1);
        
        setTimeout(pulse, 2000);
      };
      
      oscillator.start();
      pulse();
      
      // Store cleanup function
      audioElement = {
        pause: () => {
          isPlaying = false;
          oscillator.stop();
          audioContext.close();
        }
      } as any;
      
    } catch (error) {
      console.error('Failed to play ringing sound:', error);
    }
  };

  const stopRingingSound = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement = undefined;
    }
    setIsRinging(false);
  };

  const handleAccept = () => {
    stopRingingSound();
    setIsVisible(false);
    setTimeout(() => props.onAccept(), 300);
  };

  const handleDecline = () => {
    stopRingingSound();
    setIsVisible(false);
    setTimeout(() => props.onDecline(), 300);
  };

  // Phone icon for ringing animation
  const PhoneRingingIcon = () => (
    <svg 
      class={`w-8 h-8 text-green-400 ${isRinging() ? 'animate-bounce' : ''}`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      stroke-width="2"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
      />
    </svg>
  );

  // Accept icon
  const AcceptIcon = () => (
    <svg 
      class="w-6 h-6" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      stroke-width="2"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
      />
    </svg>
  );

  // Decline icon
  const DeclineIcon = () => (
    <svg 
      class="w-6 h-6" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      stroke-width="2"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        d="M6 18L18 6M6 6l12 12" 
      />
    </svg>
  );

  return (
    <div 
      class={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        transition-all duration-300
        ${isVisible() ? 'opacity-100' : 'opacity-0'}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="incoming-call-title"
    >
      {/* Backdrop */}
      <div 
        class="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleDecline}
      />

      {/* Notification Card */}
      <div 
        class={`
          relative bg-[#111] border border-white/10 rounded-2xl shadow-2xl
          max-w-sm w-full p-6
          transition-all duration-300
          ${isVisible() ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
        `}
      >
        {/* Ringing indicator */}
        <div class="flex justify-center mb-4">
          <div class="relative">
            <PhoneRingingIcon />
            {/* Pulsing rings */}
            <Show when={isRinging()}>
              <div class="absolute inset-0 -m-2">
                <div class="absolute inset-0 rounded-full border-2 border-green-400/30 animate-ping" />
              </div>
            </Show>
          </div>
        </div>

        {/* Title */}
        <h2 
          id="incoming-call-title" 
          class="text-xl font-bold text-white text-center mb-4"
        >
          Incoming Call
        </h2>

        {/* Caller Info */}
        <div class="flex flex-col items-center mb-6">
          {/* Caller Photo */}
          <div class="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-white/20">
            <Show 
              when={props.callerPhoto} 
              fallback={
                <div class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span class="text-2xl font-bold text-white">
                    {props.callerName.charAt(0).toUpperCase()}
                  </span>
                </div>
              }
            >
              <img 
                src={props.callerPhoto} 
                alt={props.callerName}
                class="w-full h-full object-cover"
              />
            </Show>
          </div>

          {/* Caller Name */}
          <p class="text-lg font-semibold text-white mb-1">
            {props.callerName}
          </p>

          {/* Call Details */}
          <div class="flex items-center gap-2">
            <Show 
              when={props.isFree} 
              fallback={
                <div class="bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full">
                  <p class="text-sm text-blue-300">
                    {props.pricePerMinute || 1} credits/min
                  </p>
                </div>
              }
            >
              <div class="bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full">
                <p class="text-sm text-green-300 font-semibold">
                  Free Call
                </p>
              </div>
            </Show>
          </div>
        </div>

        {/* Action Buttons */}
        <div class="flex gap-4">
          {/* Decline Button */}
          <button
            onClick={handleDecline}
            class="
              flex-1 bg-red-500/90 hover:bg-red-500 active:scale-95
              text-white font-semibold py-4 rounded-xl
              flex items-center justify-center gap-2
              transition-all duration-200
              border border-red-400/20
              shadow-lg
              touch-manipulation
            "
            aria-label="Decline call"
          >
            <DeclineIcon />
            <span>Decline</span>
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            class="
              flex-1 bg-green-500/90 hover:bg-green-500 active:scale-95
              text-white font-semibold py-4 rounded-xl
              flex items-center justify-center gap-2
              transition-all duration-200
              border border-green-400/20
              shadow-lg
              touch-manipulation
            "
            aria-label="Accept call"
          >
            <AcceptIcon />
            <span>Accept</span>
          </button>
        </div>

        {/* Additional Info */}
        <Show when={!props.isFree && props.pricePerMinute}>
          <p class="text-xs text-white/50 text-center mt-4">
            You will be charged {props.pricePerMinute} credits per minute
          </p>
        </Show>
      </div>
    </div>
  );
}
