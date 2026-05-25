import { createEffect, onCleanup, createSignal, Show } from "solid-js";

interface VideoContainerProps {
  stream: MediaStream | null;
  isMirrored?: boolean;
  isLocal?: boolean;
}

export default function VideoContainer(props: VideoContainerProps) {
  let videoRef: HTMLVideoElement | undefined;
  const [videoError, setVideoError] = createSignal(false);
  const [retryCount, setRetryCount] = createSignal(0);
  
  createEffect(() => {
    if (videoRef && props.stream) {
      videoRef.srcObject = props.stream;
      videoRef.play().catch(err => {
        console.error('Video play error:', err);
        handleVideoError();
      });
    }
  });
  
  // Handle video playback errors
  const handleVideoError = () => {
    console.error('Video playback error occurred');
    
    // Attempt to reload video on first error
    if (retryCount() === 0 && videoRef && props.stream) {
      console.log('Attempting to reload video...');
      setRetryCount(1);
      
      // Try to reload
      setTimeout(() => {
        if (videoRef && props.stream) {
          videoRef.load();
          videoRef.play().catch(err => {
            console.error('Video reload failed:', err);
            setVideoError(true);
          });
        }
      }, 500);
    } else {
      // Show fallback UI after retry fails
      setVideoError(true);
    }
  };
  
  onCleanup(() => {
    if (videoRef) {
      videoRef.srcObject = null;
    }
  });
  
  return (
    <div class="absolute inset-0 bg-black flex items-center justify-center">
      <Show when={!videoError()} fallback={
        <div class="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <svg class="w-16 h-16 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 00-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" />
          </svg>
          <div>
            <p class="text-white font-semibold mb-1">Video Unavailable</p>
            <p class="text-white/60 text-sm">Unable to display video stream</p>
          </div>
        </div>
      }>
        <video
          ref={videoRef}
          autoplay
          playsinline
          onError={handleVideoError}
          class={`w-full h-full object-cover ${props.isMirrored ? 'scale-x-[-1]' : ''}`}
        />
      </Show>
    </div>
  );
}
