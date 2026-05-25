import { Show, createMemo, createEffect, onCleanup, createSignal, For } from "solid-js";
import { useAuth } from "~/lib/auth";
import { usePublicProfile } from "~/hooks/usePublicProfile";
import { recordProfileView } from "~/lib/profileViews";
import ProfileNotFound from "~/components/profile/ProfileNotFound";
import { IoClose, IoChevronBack, IoChevronForward, IoChatbubbles, IoCall } from "solid-icons/io";
import { calculateAge } from "~/lib/profile/profileHelpers";
import { getZodiacSign } from "~/lib/profile/zodiacHelpers";
import { doc, getDoc } from "firebase/firestore";
import { db } from "~/lib/firebase";


interface ProfileModalProps {
  userId: string;
  onClose: () => void;
}

export default function ProfileModal(props: ProfileModalProps) {
  const { user } = useAuth();
  const [activePhoto, setActivePhoto] = createSignal(0);
  

  const { profileData, notFound } = usePublicProfile(() => props.userId);

  // Track profile view
  createEffect(() => {
    const currentUser = user();
    if (!currentUser || !props.userId || currentUser.uid === props.userId) return;

    getDoc(doc(db, "users", currentUser.uid))
      .then((userDoc) => {
        let viewerName = currentUser.displayName || "Unknown";
        let viewerPhoto = currentUser.photoURL || "";

        if (userDoc.exists()) {
          const userData = userDoc.data();
          viewerName = userData.name || userData.displayName || viewerName;
          viewerPhoto =
            (userData.photos && userData.photos[0]) ||
            userData.photoURL ||
            viewerPhoto;
        }

        return recordProfileView(
          currentUser.uid,
          props.userId,
          viewerName,
          viewerPhoto
        );
      })
      .catch(() => {});
  });

  const isOwnProfile = createMemo(() => user()?.uid === props.userId);

  const photos = createMemo(() => {
    const data = profileData();
    return Array.isArray(data?.photos)
      ? data.photos.filter((url): url is string => typeof url === "string")
      : [];
  });

  const age = createMemo(() =>
    profileData()?.age || calculateAge(profileData()?.dob)
  );

  const zodiac = createMemo(() =>
    getZodiacSign(profileData()?.dob)
  );

  const userName = createMemo(() => {
    const name = profileData()?.name;
    return name?.trim() || "User";
  });



  // Prevent background scrolling when modal is open
  createEffect(() => {
    document.body.style.overflow = 'hidden';
    onCleanup(() => {
      document.body.style.overflow = '';
    });
  });

  if (notFound()) {
    return (
      <div class="fixed inset-y-0 left-0 lg:left-72 right-12 md:right-16 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg p-6 relative">
          <button onClick={props.onClose} class="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
            <IoClose size={24} />
          </button>
          <ProfileNotFound />
        </div>
      </div>
    );
  }

  return (
    <div class="fixed inset-y-0 left-0 lg:left-72 right-12 md:right-16 z-[100] bg-white dark:bg-zinc-950 flex flex-col animate-in slide-in-from-bottom-6 duration-500 overflow-hidden">
      
      {/* Page Header */}
      <div class="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div class="flex flex-col">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">{userName()}</h2>
          <Show when={profileData()?.isHost}>
            <span class="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Verified Host</span>
          </Show>
        </div>
        <button
          onClick={props.onClose}
          class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all active:scale-90"
        >
          <IoClose size={22} />
        </button>
      </div>

      {/* Scrollable Page Content */}
      <div class="flex-1 overflow-y-auto overscroll-contain scrollbar-hide">
        <Show when={profileData()}>
          <div class="w-full">
            <div class="flex flex-col lg:flex-row min-h-full items-start">
              
              {/* GALLERY SECTION - Left on Desktop, Top on Mobile */}
              <div class="w-full lg:w-[400px] xl:w-[480px] shrink-0 p-0 lg:p-8 lg:sticky lg:top-0">
                <div class="relative aspect-[4/5] lg:rounded-[2.5rem] overflow-hidden group shadow-2xl bg-slate-100 dark:bg-zinc-900">
                  <img
                    src={photos()[activePhoto()] || photos()[0] || ""}
                    alt={userName()}
                    class="w-full h-full object-cover transition-all duration-700"
                  />
                  
                  {/* Navigation Arrows */}
                  <Show when={photos().length > 1}>
                    <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActivePhoto(p => p > 0 ? p - 1 : photos().length - 1) }}
                        class="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
                      >
                        <IoChevronBack size={20} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActivePhoto(p => p < photos().length - 1 ? p + 1 : 0) }}
                        class="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
                      >
                        <IoChevronForward size={20} />
                      </button>
                    </div>
                    
                    {/* Photo Progress Indicators */}
                    <div class="absolute bottom-6 inset-x-0 flex justify-center gap-1.5 px-10">
                      <For each={photos()}>
                        {(_, i) => (
                          <div 
                            class={`h-1 rounded-full transition-all duration-300 ${activePhoto() === i() ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                          />
                        )}
                      </For>
                    </div>
                  </Show>

                  {/* Mobile Name Overlay (Hidden on LG) */}
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 lg:hidden pointer-events-none" />
                  <div class="absolute bottom-0 left-0 p-8 w-full lg:hidden pointer-events-none">
                    <h1 class="text-4xl font-black tracking-tighter text-white drop-shadow-2xl">
                      {userName()}
                    </h1>
                  </div>
                </div>

                {/* Desktop Thumbnails */}
                <Show when={photos().length > 1}>
                  <div class="hidden lg:flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide px-2">
                    <For each={photos()}>
                      {(photo, i) => (
                        <button 
                          onClick={() => setActivePhoto(i())}
                          class={`w-16 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${activePhoto() === i() ? 'border-indigo-500 scale-105 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        >
                          <img src={photo} class="w-full h-full object-cover" />
                        </button>
                      )}
                    </For>
                  </div>
                </Show>
              </div>

              {/* INFO SECTION - Right on Desktop, Bottom on Mobile */}
              <div class="flex-1 flex flex-col bg-white dark:bg-zinc-950">
                <div class="px-6 sm:px-10 py-10 sm:py-16 space-y-12 lg:space-y-16">
                  
                  {/* Desktop Name Header (Hidden on Mobile) */}
                  <div class="hidden lg:block space-y-4">
                    <h1 class="text-6xl xl:text-8xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.85]">
                      {userName()}
                    </h1>
                    <Show when={profileData()?.isHost}>
                      <span class="inline-block text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em] bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                        Verified Host
                      </span>
                    </Show>
                  </div>

                  {/* Stats & Actions */}
                  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-10 border-b border-gray-100 dark:border-zinc-900 pb-12">
                    <div class="flex flex-wrap items-center gap-x-8 gap-y-6">
                        <Show when={profileData()?.showAge !== false}>
                          <div class="flex flex-col gap-1">
                            <span class="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Age</span>
                            <span class="text-xl font-bold text-gray-900 dark:text-white flex items-baseline gap-1">
                              {age()} <span class="text-xs font-medium opacity-40 uppercase">yrs</span>
                            </span>
                          </div>
                        </Show>
                        
                        <div class="w-px h-10 bg-gray-100 dark:bg-zinc-800 hidden sm:block" />
                        
                        <div class="flex flex-col gap-1">
                          <span class="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Gender</span>
                          <span class="text-xl font-bold text-gray-900 dark:text-white">{profileData()?.gender}</span>
                        </div>
                        
                        <div class="w-px h-10 bg-gray-100 dark:bg-zinc-800 hidden sm:block" />
                        
                        <div class="flex flex-col gap-1">
                          <span class="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Location</span>
                          <span class="text-xl font-bold text-gray-900 dark:text-white">{profileData()?.country}</span>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <button class="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-base font-bold shadow-xl shadow-indigo-500/25 transition-all hover:-translate-y-1 active:scale-95 whitespace-nowrap">
                        <IoChatbubbles size={20} />
                        Send Message
                      </button>
                      <button class="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-base font-bold transition-all hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:-translate-y-1 active:scale-95 whitespace-nowrap text-gray-900 dark:text-white">
                        <IoCall size={20} />
                        Start Call
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 xl:grid-cols-2 gap-16">
                    <div class="space-y-10">
                      <div>
                        <h3 class="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-8 flex items-center gap-3">
                          <span class="w-8 h-[2px] bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                          Personal Details
                        </h3>
                        
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                          <Show when={profileData()?.showAge !== false}>
                            <InfoCard label="Age" value={`${age()} years`} />
                          </Show>
                          <Show when={profileData()?.gender}>
                            <InfoCard label="Gender" value={profileData()?.gender} />
                          </Show>
                          <Show when={profileData()?.country}>
                            <InfoCard label="Location" value={profileData()?.country} />
                          </Show>
                          <Show when={profileData()?.language}>
                            <InfoCard label="Language" value={profileData()?.language} />
                          </Show>
                          <Show when={zodiac()}>
                            <InfoCard label="Zodiac" value={zodiac()} />
                          </Show>
                        </div>
                      </div>
                    </div>

                    <Show when={profileData()?.bio}>
                      <div class="flex flex-col">
                        <h3 class="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-8 flex items-center gap-3">
                          <span class="w-8 h-[2px] bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                          The Story
                        </h3>
                        <div class="relative">
                          <p class="text-2xl sm:text-3xl leading-relaxed text-slate-700 dark:text-zinc-300 font-medium italic pl-10">
                            <span class="absolute left-0 top-0 text-6xl text-indigo-500/20 font-serif leading-none">“</span>
                            {profileData()?.bio}
                          </p>
                        </div>
                      </div>
                    </Show>
                  </div>


                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}

function InfoCard(props: { label: string; value: string | undefined }) {
  return (
    <div class="px-5 py-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm">
      <span class="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block mb-1">{props.label}</span>
      <span class="font-bold text-sm text-gray-800 dark:text-gray-200">{props.value}</span>
    </div>
  );
}
