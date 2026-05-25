import { Show, createSignal } from "solid-js";

interface ProfilePhotoProps {
  photos: string[];
  userName: string;
  initials: string;
  roomFrame: string;
}

export default function ProfilePhoto(props: ProfilePhotoProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = createSignal(0);

  const nextPhoto = () => {
    if (props.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % props.photos.length);
    }
  };

  const prevPhoto = () => {
    if (props.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + props.photos.length) % props.photos.length);
    }
  };

  const currentPhoto = () => props.photos[currentPhotoIndex()] || "";

  return (
    <>
      <Show when={props.photos.length > 0}>
        {/* Photo Gallery - Neural Frame Design */}
        <div class="relative w-full aspect-square rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl group">
          {/* Scanner UI Overlay */}
          <div class="absolute inset-0 z-20 pointer-events-none">

            {/* Data Badge */}
            <div class="absolute bottom-4 sm:bottom-5 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-3 sm:px-4 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-full border border-white/20">
              <span class="text-[9px] sm:text-[10px] md:text-[11px] font-black text-white uppercase tracking-[0.15em] sm:tracking-[0.2em]">Photos • {currentPhotoIndex() + 1}/{props.photos.length}</span>
            </div>
          </div>

          {/* Main Photo */}
          <img
            src={currentPhoto()}
            alt={`${props.userName}'s profile photo`}
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Controls */}
          <Show when={props.photos.length > 1}>
            <button
              onClick={prevPhoto}
              class="absolute left-2 sm:left-3 md:left-4 lg:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-white/10 backdrop-blur-xl hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20 z-30 transition-all active:scale-95"
            >
              <svg class="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>

            <button
              onClick={nextPhoto}
              class="absolute right-2 sm:right-3 md:right-4 lg:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-white/10 backdrop-blur-xl hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20 z-30 transition-all active:scale-95"
            >
              <svg class="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>
          </Show>
        </div>
      </Show>

      {/* Fallback - No photos */}
      <Show when={props.photos.length === 0}>
        <div class="w-full aspect-square rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] bg-gradient-to-br from-[#111] to-[#1a1a1a] flex items-center justify-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white/30 border border-white/10 shadow-2xl">
          <span aria-label={`${props.userName}'s initial`}>{props.initials}</span>
        </div>
      </Show>
    </>
  );
}
