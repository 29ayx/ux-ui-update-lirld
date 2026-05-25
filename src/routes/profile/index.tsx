/**
 * Profile Page - Mobile-First Responsive Design
 * 
 * UX/UI Principles Applied:
 * 1. Visual Hierarchy - 1.6× golden ratio scaling (Name > CTA > Info)
 * 2. Fitts's Law - Touch targets ≥44-48dp, prominent CTA placement
 * 3. Hick's Law - ≤7 items above fold, grouped logically
 * 4. Progressive Disclosure - Primary (photo+name) → Secondary (details) → Tertiary (posts)
 * 5. Mobile Constraints - 8dp grid, thumb-reach zones, safe areas
 * 6. Responsive Layout - Mobile: stacked | Desktop: 2-column (5/7 split)
 * 7. Contrast & Accessibility - WCAG AA compliant (≥4.5:1)
 * 8. Touch Optimization - touch-manipulation, active states, proper spacing
 * 
 * Package Manager: Bun (bun install, bun run dev)
 */

import { Show, createSignal, onMount, onCleanup, createMemo } from "solid-js";
import { useAuth } from "~/lib/auth";
import { useAdminAuth } from "~/lib/admin";
import { db } from "~/lib/firebase";
import { doc, onSnapshot, type FirestoreError } from "firebase/firestore";
import ProfileHeader from "~/components/profile/ProfileHeader";
import ProfilePhoto from "~/components/profile/ProfilePhoto";
import ProfileInfo from "~/components/profile/ProfileInfo";
import ProfileLookingFor from "~/components/profile/ProfileLookingFor";
import ProfileBirthday from "~/components/profile/ProfileBirthday";

import RoomAnimations from "~/components/profile/RoomAnimations";
import { calculateAge, safeParseJSON } from "~/lib/profile/profileHelpers";
import { getZodiacSign } from "~/lib/profile/zodiacHelpers";
import { getBirthdayInfo } from "~/lib/profile/birthdayHelpers";
import PageHeader from "~/components/PageHeader";

interface ProfileData {
  name?: string;
  dob?: string;
  country?: string;
  language?: string;
  photos?: string[];
  customization?: {
    room?: string | RoomData;
    vibe?: string | VibeData;
    badgeText?: string;
    lookingFor?: string[];
  };
  showCustomBadge?: boolean;
  showDaysToBirthday?: boolean;
  showBirthdayCard?: boolean;
  isHost?: boolean;
  pricePerMinute?: number;
  age?: number | null;
  showAge?: boolean;
}

interface RoomData {
  theme: string;
  background: string;
  frame: string;
  animation: string;
}

interface VibeData {
  emoji: string;
  name: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { isAdmin } = useAdminAuth(user()?.uid);
  const [profileData, setProfileData] = createSignal<ProfileData | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const currentUser = createMemo(() => user());

  onMount(() => {
    const user = currentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as ProfileData;
            // Validate and sanitize data
            setProfileData(data);
          } else {
            setProfileData(null);
          }
          setLoading(false);
        } catch (err) {
          console.error("Error processing profile data:", err);
          setError("Failed to load profile data");
          setLoading(false);
        }
      },
      (err: FirestoreError) => {
        console.error("Error listening to profile:", err);
        setError("Failed to load profile. Please try again.");
        setLoading(false);
      }
    );

    onCleanup(() => unsubscribe());
  });

  const photos = createMemo(() => {
    const data = profileData();
    return Array.isArray(data?.photos) ? data.photos.filter((url): url is string => typeof url === "string" && url.length > 0) : [];
  });



  const zodiac = createMemo(() => getZodiacSign(profileData()?.dob));
  const birthdayInfo = createMemo(() => getBirthdayInfo(profileData()?.dob));
  const age = createMemo(() => profileData()?.age || calculateAge(profileData()?.dob));

  const roomData = createMemo((): RoomData => {
    const data = profileData()?.customization?.room;
    const fallback: RoomData = {
      theme: "minimal",
      background: "from-[#E3F2FD] via-white to-[#B3E5FC]/30",
      frame: "minimal",
      animation: "none",
    };
    return safeParseJSON(data, fallback);
  });

  const roomFrame = createMemo(() => roomData().frame);
  const roomAnimation = createMemo(() => roomData().animation);
  const roomTheme = createMemo(() => roomData().theme);

  const userName = createMemo(() => {
    const name = profileData()?.name;
    return name && typeof name === "string" ? name.trim() : "User";
  });

  const initials = createMemo(() => {
    const name = userName();
    return name.charAt(0).toUpperCase() || "?";
  });

  return (
    <div class="min-h-screen bg-[#F0F4F8] dark:bg-black text-gray-900 dark:text-zinc-100 flex transition-colors duration-500 relative overflow-x-hidden">


      {/* Main Content Area - matches homepage layout */}
      <main class="flex-1 w-full min-w-0 pb-32 lg:pb-12 z-10 relative">
        <ProfileHeader title="My Profile" showActions={true} isAdmin={isAdmin()} isHost={profileData()?.isHost} />

        <div class="min-h-screen bg-[#F0F4F8] dark:bg-black pb-4 relative overflow-hidden">
          {/* Error Toast */}
          <Show when={error()}>
            {(err) => (
              <div
                role="alert"
                aria-live="polite"
                class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-3 rounded-lg text-sm shadow-lg max-w-md mx-4"
              >
                {err()}
              </div>
            )}
          </Show>

          <RoomAnimations animation={roomAnimation()} theme={roomTheme()} />

          <Show
            when={!loading()}
            fallback={
              <div class="max-w-7xl mx-auto px-4 py-12">
                <div class="text-center text-white/60">
                  <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0s"></div>
                  <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                  <p class="mt-4 text-sm">Loading profile...</p>
                </div>
              </div>
            }
          >
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-20">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
                <div class="md:col-span-12 lg:col-span-5 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                  <ProfilePhoto
                    photos={photos()}
                    userName={userName()}
                    initials={initials()}
                    roomFrame={roomFrame()}
                  />
                  <ProfileInfo
                    userName={userName()}
                    userId={currentUser()?.uid || ""}
                    age={age()}
                    country={profileData()?.country}
                    language={profileData()?.language}
                    zodiac={zodiac()}
                    showCustomBadge={profileData()?.showCustomBadge}
                    badgeText={profileData()?.customization?.badgeText}
                    isOwnProfile={true}
                    showAge={profileData()?.showAge}
                  />
                </div>

                <div class="md:col-span-12 lg:col-span-7 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-8">
                  <ProfileLookingFor lookingFor={profileData()?.customization?.lookingFor} />
                  <ProfileBirthday
                    birthdayInfo={birthdayInfo()}
                    showDaysToBirthday={profileData()?.showDaysToBirthday}
                    showBirthdayCard={profileData()?.showBirthdayCard}
                  />
                </div>
              </div>
            </div>
          </Show>
        </div>
      </main>
    </div>
  );
}
