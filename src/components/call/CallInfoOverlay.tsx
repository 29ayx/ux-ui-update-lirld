import { Show } from "solid-js";

interface CallInfoOverlayProps {
  duration: string;
  cost: string;
  isFree?: boolean;
  connectionState: RTCPeerConnectionState;
}

export default function CallInfoOverlay(props: CallInfoOverlayProps) {
  // Connection status display
  const connectionStatus = () => {
    switch (props.connectionState) {
      case 'connected':
        return { text: 'Connected', color: 'bg-green-400' };
      case 'connecting':
        return { text: 'Connecting...', color: 'bg-yellow-400' };
      case 'disconnected':
        return { text: 'Disconnected', color: 'bg-red-400' };
      case 'failed':
        return { text: 'Connection Failed', color: 'bg-red-400' };
      default:
        return { text: 'Initializing...', color: 'bg-gray-400' };
    }
  };

  return (
    <div class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 sm:p-6 pb-12">
      <div class="flex flex-col items-center gap-2 sm:gap-3">
        {/* Connection Status */}
        <div class="flex items-center gap-2">
          <div class={`w-2 h-2 rounded-full ${connectionStatus().color} ${props.connectionState === 'connected' ? 'animate-pulse' : ''}`} />
          <span class="text-xs sm:text-sm text-white/90 font-medium">
            {connectionStatus().text}
          </span>
        </div>

        {/* Call Duration */}
        <div class="text-center">
          <h2 class="text-3xl sm:text-4xl font-bold text-white font-mono drop-shadow-lg">
            {props.duration}
          </h2>
        </div>

        {/* Cost and Balance Information */}
        <Show when={!props.isFree}>
          <div class="text-center">
            <p class="text-xs sm:text-sm text-white/80 drop-shadow">
              Cost: <span class="text-white font-semibold">{props.cost}</span> credits
            </p>
          </div>
        </Show>

        {/* Free Call Badge */}
        <Show when={props.isFree}>
          <div class="px-3 py-1 bg-green-500/30 border border-green-400/50 rounded-full backdrop-blur-sm">
            <p class="text-xs sm:text-sm text-green-300 font-semibold">
              Free Call
            </p>
          </div>
        </Show>
      </div>
    </div>
  );
}
