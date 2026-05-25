import { useParams, useNavigate } from "@solidjs/router";
import { Show, createMemo, createEffect } from "solid-js";
import { useAuth } from "~/lib/auth";
import { usePublicProfile } from "~/hooks/usePublicProfile";
import { recordProfileView } from "~/lib/profileViews";
import ProfileNotFound from "~/components/profile/ProfileNotFound";
import PageHeader from "~/components/PageHeader";
import { IoArrowBack } from "solid-icons/io";
import { calculateAge } from "~/lib/profile/profileHelpers";
import { getZodiacSign } from "~/lib/profile/zodiacHelpers";
import { doc, getDoc } from "firebase/firestore";
import { db } from "~/lib/firebase";
import UserSection from "~/components/home/UserSection";
import { useUserCache } from "~/hooks/useUserCache";
import { Title, Meta } from "@solidjs/meta";

export default function PublicProfile() {
  const params = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const userCache = useUserCache(() => user()?.uid);
  const { profileData, notFound } = usePublicProfile(() => params.userId);

  // Track profile view
  createEffect(() => {
    const currentUser = user();
    if (!currentUser || !params.userId || currentUser.uid === params.userId) return;

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
          params.userId,
          viewerName,
          viewerPhoto
        );
      })
      .catch(() => {});
  });

  const isOwnProfile = createMemo(() => user()?.uid === params.userId);

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

  if (notFound()) return <ProfileNotFound />;

  const suggestedUsers = createMemo(() => {
    return userCache
      .users()
      .filter(
        (u) => u.user_id !== params.userId && u.user_id !== user()?.uid
      )
      .sort(() => 0.5 - Math.random())
      .slice(0, 8);
  });

  return (
    <div class="min-h-screen bg-[#F6F7FB] dark:bg-black flex text-gray-900 dark:text-white">



      <main class="flex-1">

        <PageHeader
          title={userName()}
          right={
            <button
              onClick={() => navigate(-1)}
              class="w-9 h-9 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition"
            >
              <IoArrowBack size={18} />
            </button>
          }
        />

        <Show when={profileData()}>
          <Title>{`${userName()} - Lirld`}</Title>
          <Meta name="description" content={`Connect with ${userName()} on Lirld`} />

          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              
              {/* LEFT: PHOTO SECTION */}
              <div class="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28">
                <div class="relative aspect-[4/5] sm:aspect-square lg:aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-200 dark:bg-zinc-800 group">
                  <img
                    src={photos()[0] || ""}
                    alt={userName()}
                    class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div class="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2.5rem]" />
                </div>

                <div class="mt-8 flex gap-4 lg:hidden">
                   <button class="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]">
                    Send Message
                  </button>
                  <button class="flex-1 py-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl font-bold transition-all active:scale-[0.98]">
                    Start Call
                  </button>
                </div>
              </div>

              {/* RIGHT: INFO SECTION */}
              <div class="lg:col-span-7 xl:col-span-8 space-y-12">
                
                <div class="space-y-6">
                  <div>
                    <h1 class="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                      {userName()}
                    </h1>
                    
                    <div class="flex flex-wrap items-center gap-3 text-lg sm:text-xl text-slate-500 dark:text-zinc-400 font-medium">
                      <Show when={profileData()?.showAge !== false}>
                        <span class="flex items-center">
                          {age()} <span class="ml-1 text-sm uppercase tracking-wider opacity-60">yrs</span>
                        </span>
                        <span class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                      </Show>
                      <span>{profileData()?.gender}</span>
                      <span class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                      <span>{profileData()?.country}</span>
                    </div>
                  </div>

                  <div class="hidden lg:flex gap-4">
                    <button class="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-lg font-bold shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:scale-95">
                      Send Message
                    </button>
                    <button class="px-10 py-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-lg font-bold transition-all hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:-translate-y-0.5 active:scale-95">
                      Start Call
                    </button>
                  </div>
                </div>

                <div class="space-y-8">
                  <div>
                    <h3 class="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-6">
                      About Profile
                    </h3>
                    
                    <div class="flex flex-wrap gap-3">
                      <Show when={profileData()?.showAge !== false}>
                        <div class="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                          <span class="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase block mb-0.5">Age</span>
                          <span class="font-bold">{age()} years</span>
                        </div>
                      </Show>

                      <Show when={profileData()?.gender}>
                        <div class="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                          <span class="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase block mb-0.5">Gender</span>
                          <span class="font-bold">{profileData()?.gender}</span>
                        </div>
                      </Show>

                      <Show when={profileData()?.country}>
                        <div class="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                          <span class="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase block mb-0.5">Location</span>
                          <span class="font-bold">{profileData()?.country}</span>
                        </div>
                      </Show>

                      <Show when={profileData()?.language}>
                        <div class="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                          <span class="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase block mb-0.5">Language</span>
                          <span class="font-bold">{profileData()?.language}</span>
                        </div>
                      </Show>

                      <Show when={zodiac()}>
                        <div class="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                          <span class="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase block mb-0.5">Zodiac</span>
                          <span class="font-bold">{zodiac()}</span>
                        </div>
                      </Show>
                    </div>
                  </div>

                  <Show when={profileData()?.bio}>
                    <div class="max-w-2xl">
                      <h3 class="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-4">
                        Bio
                      </h3>
                      <p class="text-xl leading-relaxed text-slate-600 dark:text-zinc-400 font-medium italic">
                        "{profileData()?.bio}"
                      </p>
                    </div>
                  </Show>
                </div>

              </div>
            </div>

            {/* DISCOVER MORE SECTION */}
            <div class="mt-24 pt-16 border-t border-slate-200 dark:border-zinc-800">

              <h3 class="text-xl md:text-2xl font-semibold mb-6">
                Discover More People
              </h3>

              <UserSection
                title=""
                users={suggestedUsers()}
                layout="grid"
                onMessageSent={() => {}}
              />
            </div>

          </div>
        </Show>

      </main>
    </div>
  );
}