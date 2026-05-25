import { createEffect, onCleanup } from "solid-js";

interface LocalVideoPreviewProps {
  stream: MediaStream | null;
  onTap: () => void;
  isMirrored?: boolean;
}

export default function LocalVideoPreview(props: LocalVideoPreviewProps) {
  let videoRef: HTMLVideoElement | undefined;
  
  createEffect(() => {
    if (videoRef && props.stream) {
      videoRef.srcObject = props.stream;
      videoRef.play().catch(err => console.error('Local video play error:', err));
    }
  });
  
  // Cleanup video srcObject on unmount
  onCleanup(() => {
    if (videoRef) {
      videoRef.srcObject = null;
    }
  });
  
  return (
    <button
      onClick={props.onTap}
      aria-label="Swap video positions"
      class="absolute bottom-24 sm:bottom-28 right-3 sm:right-4 w-20 h-28 sm:w-24 sm:h-32 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl cursor-pointer hover:scale-105 transition-transform active:scale-95 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <video
        ref={videoRef}
        autoplay
        playsinline
        muted
        aria-hidden="true"
        class={`w-full h-full object-cover ${props.isMirrored ? 'scale-x-[-1]' : ''}`}
      />
    </button>
  );
}
