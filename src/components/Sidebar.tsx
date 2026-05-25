import { A } from "@solidjs/router";
import {
  IoSearchOutline,
  IoNotificationsOutline,
  IoChatbubblesOutline,
  IoCallOutline,
  IoDiamondOutline,
  IoSettingsOutline
} from "solid-icons/io";
import { useAuth } from "~/lib/auth";
import { Show, createSignal, createEffect, onCleanup } from "solid-js";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "~/lib/firebase";



export default function Sidebar() {
  const { user } = useAuth();
  const [profile, setProfile] = createSignal<any>(null);
  const [loadingProfile, setLoadingProfile] = createSignal(true);

  createEffect(() => {
    const u = user();
    if (!u) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    const unsubscribe = onSnapshot(doc(db, "users", u.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
      setLoadingProfile(false);
    }, (err) => {
      console.error("Error fetching profile:", err);
      setLoadingProfile(false);
    });

    onCleanup(() => unsubscribe());
  });

  const profileName = () => profile()?.name || profile()?.Name || 'User';
  const profilePhoto = () => {
    const photos = profile()?.photos;
    if (Array.isArray(photos) && photos.length > 0) return photos[0];
    return profile()?.imageUrl || `https://ui-avatars.com/api/?name=${profileName()}&background=05073C&color=fff`;
  };

  return (
    <aside class="hidden lg:flex flex-col w-72 h-screen fixed top-0 left-0 border-r border-gray-200/50 dark:border-zinc-800/50 bg-[#05073C] backdrop-blur-xl z-[60] shrink-0">
      <div class="p-6">
        <div class="flex flex-col">
          <h1 class="text-3xl font-black tracking-tighter text-white animate-in fade-in zoom-in duration-700">
            Lirld.com
          </h1>
          <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500">Always feel connected</span>
        </div>
      </div>

      {/* User Profile Section */}
      <div class="px-4 pb-6">
        <Show when={user() && !loadingProfile()} fallback={
          <div class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
            <div class="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
            <div class="flex flex-col gap-2">
              <div class="w-20 h-3 bg-white/10 rounded animate-pulse" />
              <div class="w-24 h-2 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        }>
          <A
            href="/profile"
            class="flex items-center justify-between group cursor-pointer p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg shadow-black/20"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="relative">
                <img
                  src={profilePhoto()}
                  alt={profileName()}
                  class="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-purple-500/50 transition-all"
                />
                <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#05073C] rounded-full" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[14px] font-bold text-white truncate leading-tight group-hover:text-purple-300 transition-colors">
                  {profileName()}
                </span>
                <span class="text-[11px] text-gray-400 truncate font-medium">
                  {profile()?.email || user()?.email}
                </span>
              </div>
            </div>
            <IoSettingsOutline class="w-5 h-5 text-gray-500 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
          </A>
        </Show>
      </div>

      <nav class="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <A
          href="/"
          activeClass="bg-white text-[#010b80] shadow-md"
          inactiveClass="text-white/80 hover:bg-white/10 hover:text-white"
          end
          class="flex items-center gap-4 px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all"
        >
          <IoSearchOutline class="w-6 h-6 shrink-0" />
          Discover
        </A>
        <A
          href="/chats"
          activeClass="bg-white text-[#010b80] shadow-md"
          inactiveClass="text-white/80 hover:bg-white/10 hover:text-white"
          end
          class="flex items-center gap-4 px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all"
        >
          <IoChatbubblesOutline class="w-6 h-6 shrink-0" />
          Chats
        </A>
        <A
          href="/call-logs"
          activeClass="bg-white text-[#010b80] shadow-md"
          inactiveClass="text-white/80 hover:bg-white/10 hover:text-white"
          end
          class="flex items-center gap-4 px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all"
        >
          <IoCallOutline class="w-6 h-6 shrink-0" />
          Calls
        </A>
        <A
          href="/notifications"
          activeClass="bg-white text-[#010b80] shadow-md"
          inactiveClass="text-white/80 hover:bg-white/10 hover:text-white"
          class="flex items-center gap-4 px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all"
        >
          <IoNotificationsOutline class="w-6 h-6 shrink-0" />
          Notifications
        </A>
      </nav>

      <div class="flex flex-col gap-2 p-2 mt-auto">
        <div class="m-2">
          <div class="relative overflow-hidden rounded-xl bg-[#05073C] border border-gray-700 p-2">
            <div class="absolute -top-10 -right-10 w-32 h-32  rounded-full blur-[40px] group-hover:bg-pink-500/30 transition-colors" />

            <div class="relative p-2 flex flex-col gap-4">
              <div class="space-y-1">
                <div class="flex felx-col p-2 gap-2 ">
                  <IoDiamondOutline class="w-5 h-5 text-pink-500" />
                  <h3 class="font-bold text-white">Become a Host</h3></div>
                <p class="text-[13px] leading-relaxed text-white font-medium">
                  Earn money by taking calls, making new friends and more!
                </p>
              </div>

              <button class="w-full py-2  bg-gradient-to-t from-[#352a9d] to-[#6042F6] text-white rounded-lg text-md font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}


