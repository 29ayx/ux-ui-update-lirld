import { Show, createSignal, onMount, onCleanup } from "solid-js";
import { useAuth } from "~/lib/auth";
import { db } from "~/lib/firebase";
import { doc, onSnapshot, updateDoc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { A } from "@solidjs/router";
import { HiSolidChevronLeft, HiSolidCheckCircle, HiSolidArrowRightOnRectangle } from "solid-icons/hi";
import HostPromoCardCompact from "~/components/HostPromoCardCompact";
import HostStatusCard from "~/components/HostStatusCard";
import { getHostApplicationStatus, shouldShowPromoCard, withdrawHostApplication } from "~/lib/host";
import type { HostApplication } from "~/lib/host";
import LoadingSpinner from "~/components/LoadingSpinner";

export default function Settings() {
  const { user, signOut } = useAuth();
  const [profileData, setProfileData] = createSignal<any>(null);
  const [locationStatus, setLocationStatus] = createSignal<"idle" | "requesting" | "granted" | "denied" | "error">("idle");
  const [locationError, setLocationError] = createSignal<string>("");
  const [hostApplication, setHostApplication] = createSignal<HostApplication | null>(null);
  const [showPromoCard, setShowPromoCard] = createSignal<boolean>(false);
  const [isLoadingHostStatus, setIsLoadingHostStatus] = createSignal<boolean>(true);
  const [showSuccessToast, setShowSuccessToast] = createSignal(false);
  const [successMessage, setSuccessMessage] = createSignal("");

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const requestLocationPermission = async () => {
    const currentUser = user();
    if (!currentUser) {
      setLocationError("Please log in to enable location");
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Geolocation is not supported");
      return;
    }

    setLocationStatus("requesting");
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Only store coordinates, no address
          const updates: any = {
            latitude,
            longitude,
            locationEnabled: true,
            locationUpdatedAt: new Date().toISOString()
          };

          await updateDoc(doc(db, "users", currentUser.uid), updates);

          setLocationStatus("granted");
          setLocationError("");
          showSuccess("Location enabled successfully!");
        } catch (error: any) {
          console.error("Error saving location:", error);
          setLocationStatus("error");
          setLocationError(error.message || "Failed to save location");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationStatus("denied");
        setLocationError("Location permission denied");
      }
    );
  };

  const disableLocation = async () => {
    const currentUser = user();
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        locationEnabled: false,
        latitude: null,
        longitude: null,
        locationUpdatedAt: null
      });
      setLocationStatus("idle");
      showSuccess("Location disabled");
    } catch (error) {
      console.error("Error disabling location:", error);
    }
  };

  const fetchHostStatus = async () => {
    const currentUser = user();
    if (!currentUser) {
      setIsLoadingHostStatus(false);
      return;
    }

    try {
      setIsLoadingHostStatus(true);

      try {
        const application = await getHostApplicationStatus(currentUser.uid);
        setHostApplication(application);
      } catch (appError: any) {
        setHostApplication(null);
      }

      const shouldShow = await shouldShowPromoCard(currentUser.uid);
      setShowPromoCard(shouldShow);
    } catch (error) {
      console.error("Error fetching host status:", error);
      setShowPromoCard(true);
    } finally {
      setIsLoadingHostStatus(false);
    }
  };

  const handleWithdrawApplication = async () => {
    const currentUser = user();
    if (!currentUser) return;

    try {
      await withdrawHostApplication(currentUser.uid);
      setHostApplication(null);
      showSuccess("Application withdrawn successfully");
    } catch (error) {
      console.error("Error withdrawing application:", error);
    }
  };

  onMount(() => {
    const currentUser = user();
    if (!currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", currentUser.uid),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setProfileData(docSnapshot.data());
        }
      }
    );

    fetchHostStatus();

    onCleanup(() => unsubscribe());
  });

  return (
    <main class="min-h-screen bg-whitedark:bg-black">
      <header class="sticky top-0 z-50 bg-whiteborder-b border-gray-400 dark:border-gray-800  dark:bg-black">
        <div class="flex flex-row gap-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <A href="/profile" class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <HiSolidChevronLeft class="w-5 h-5 text-black dark:text-white" />
          </A>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Settings</h1>
        </div>
      </header>
      {/* Success Toast */}
      <Show when={showSuccessToast()}>
        <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          ✓ {successMessage()}
        </div>
      </Show>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 mb-24 py-4 sm:py-6 lg:py-8">




        <Show when={user()}>
          {(currentUser) => (
            <div class="space-y-4">
              {/* Host Earnings Section */}
              <Show when={isLoadingHostStatus()}>
                <div class="bg-[#111] rounded-2xl p-6">
                  <div class="flex items-center justify-center gap-3">
                    <LoadingSpinner size="md" color="text-white" />
                    <span class="text-white/60 text-sm">Loading...</span>
                  </div>
                </div>
              </Show>

              <Show when={!isLoadingHostStatus()}>
                <Show when={hostApplication()}>
                  {(application) => (
                    <Show when={application().status !== 'approved'}>
                      <HostStatusCard
                        status={application().status}
                        pricePerMinute={application().pricePerMinute}
                        appliedAt={application().appliedAt}
                        onWithdraw={handleWithdrawApplication}
                      />
                    </Show>
                  )}
                </Show>

                <Show when={!hostApplication() && showPromoCard()}>
                  <HostPromoCardCompact userId={currentUser().uid} />
                </Show>
              </Show>

              {/* Account Section */}
              <div class="bg-[#111] rounded-2xl p-5 space-y-4">
                <h2 class="text-lg font-bold text-white">Account</h2>

                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-white/60 text-sm">Email</span>
                    <span class="text-white text-sm font-medium">{currentUser().email || "Not set"}</span>
                  </div>

                  <div class="flex justify-between items-center">
                    <span class="text-white/60 text-sm">Name</span>
                    <span class="text-white text-sm font-medium">
                      {currentUser().displayName || profileData()?.name || "Not set"}
                    </span>
                  </div>

                  <Show when={currentUser().phoneNumber}>
                    <div class="flex justify-between items-center">
                      <span class="text-white/60 text-sm">Phone</span>
                      <span class="text-white text-sm font-medium">{currentUser().phoneNumber}</span>
                    </div>
                  </Show>

                  <div class="flex justify-between items-center">
                    <span class="text-white/60 text-sm">Status</span>
                    <span class="text-sm font-medium">
                      {currentUser().emailVerified ? (
                        <span class="text-green-400">✓ Verified</span>
                      ) : (
                        <span class="text-yellow-400">⚠ Not verified</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy Section */}
              <div class="bg-[#111] rounded-2xl p-5 space-y-4">
                <h2 class="text-lg font-bold text-white">Privacy</h2>

                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <p class="text-white text-sm font-medium">Show Birthday Countdown</p>
                    <p class="text-white/50 text-xs mt-1">Display on your profile</p>
                  </div>
                  <button
                    onClick={async () => {
                      const currentUser = user();
                      if (!currentUser) return;

                      const newValue = !profileData()?.showDaysToBirthday;
                      try {
                        await updateDoc(doc(db, "users", currentUser.uid), {
                          showDaysToBirthday: newValue
                        });
                        showSuccess(newValue ? "Birthday countdown enabled" : "Birthday countdown disabled");
                      } catch (error) {
                        console.error("Error updating privacy setting:", error);
                      }
                    }}
                    class={`relative w-12 h-7 rounded-full transition-colors ${profileData()?.showDaysToBirthday !== false ? "bg-blue-500" : "bg-white/20"
                      }`}
                  >
                    <span
                      class={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${profileData()?.showDaysToBirthday !== false ? "translate-x-5" : ""
                        }`}
                    />
                  </button>
                </div>

                <div class="h-px bg-white/10" />

                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <p class="text-white text-sm font-medium">Accept Calls from Strangers</p>
                    <p class="text-white/50 text-xs mt-1">Allow anyone to call you, even if you're not connected</p>
                  </div>
                  <button
                    onClick={async () => {
                      const currentUser = user();
                      if (!currentUser) return;

                      const newValue = profileData()?.acceptCallsFromStrangers === false ? true : false;
                      try {
                        await updateDoc(doc(db, "users", currentUser.uid), {
                          acceptCallsFromStrangers: newValue
                        });
                        showSuccess(newValue ? "Now accepting calls from anyone" : "Only accepting calls from connections");
                      } catch (error) {
                        console.error("Error updating call privacy setting:", error);
                      }
                    }}
                    class={`relative w-12 h-7 rounded-full transition-colors ${profileData()?.acceptCallsFromStrangers !== false ? "bg-blue-500" : "bg-white/20"
                      }`}
                  >
                    <span
                      class={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${profileData()?.acceptCallsFromStrangers !== false ? "translate-x-5" : ""
                        }`}
                    />
                  </button>
                  <div class="h-px bg-white/10" />

                  <div class="flex ml-8 items-center justify-between">
                    <div class="flex-1">
                      <p class="text-white text-sm font-medium">Hide Profile</p>
                      <p class="text-white/50 text-xs mt-1">Hide your profile from others</p>
                    </div>
                    <button
                      onClick={async () => {
                        const currentUser = user();
                        if (!currentUser) return;

                        const newValue = !profileData()?.isHidden;
                        try {
                          await updateDoc(doc(db, "users", currentUser.uid), {
                            isHidden: newValue
                          });
                          showSuccess(newValue ? "Profile hidden" : "Profile visible");
                        } catch (error) {
                          console.error("Error updating privacy setting:", error);
                        }
                      }}
                      class={`relative w-12 h-7 rounded-full transition-colors ${profileData()?.isHidden ? "bg-blue-500" : "bg-white/20"
                        }`}
                    >
                      <span
                        class={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${profileData()?.isHidden ? "translate-x-5" : ""
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div class="bg-[#111] rounded-2xl p-5 space-y-4">
                <h2 class="text-lg font-bold text-white">Location</h2>

                <Show when={locationError()}>
                  <div class="bg-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                    {locationError()}
                  </div>
                </Show>

                <Show when={profileData()?.locationEnabled && profileData()?.latitude}>
                  <div class="flex items-center gap-2 text-green-400 text-sm">
                    <HiSolidCheckCircle class="w-4 h-4" />
                    <span>Location enabled</span>
                  </div>
                </Show>

                <Show when={!profileData()?.locationEnabled || !profileData()?.latitude}>
                  <button
                    onClick={requestLocationPermission}
                    disabled={locationStatus() === "requesting"}
                    class="w-full px-4 py-3 bg-white text-black font-semibold rounded-xl disabled:opacity-50"
                  >
                    {locationStatus() === "requesting" ? (
                      <span class="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" />
                        Requesting...
                      </span>
                    ) : "Enable Location"}
                  </button>
                </Show>

                <Show when={profileData()?.locationEnabled && profileData()?.latitude}>
                  <div class="flex gap-3">
                    <button
                      onClick={requestLocationPermission}
                      disabled={locationStatus() === "requesting"}
                      class="flex-1 px-4 py-3 bg-white/10 text-white font-semibold rounded-xl disabled:opacity-50"
                    >
                      Update
                    </button>
                    <button
                      onClick={disableLocation}
                      class="flex-1 px-4 py-3 bg-red-500/20 text-red-400 font-semibold rounded-xl"
                    >
                      Disable
                    </button>
                  </div>
                </Show>

                <p class="text-white/40 text-xs">
                  Your location helps us show you nearby users. We only store coordinates, not your address.
                </p>
              </div>

              {/* Danger Zone */}
              <div class="bg-[#111] rounded-2xl p-5 space-y-4">
                <h2 class="text-lg font-bold text-red-500">Danger Zone</h2>
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <p class="text-white text-sm font-medium">Delete Account</p>
                    <p class="text-white/50 text-xs mt-1">Permanently delete your account and all data</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                        return;
                      }

                      const currentUser = user();
                      if (!currentUser) return;

                      try {
                        const uid = currentUser.uid;
                        const userDocRef = doc(db, "users", uid);

                        // 1. Archive user data
                        const userSnapshot = await getDoc(userDocRef);
                        if (userSnapshot.exists()) {
                          const userData = userSnapshot.data();
                          await setDoc(doc(db, "users", `__deleted_${uid}`), {
                            ...userData,
                            deletedAt: new Date().toISOString(),
                            originalUid: uid
                          });

                          // 2. Delete original Firestore document
                          await deleteDoc(userDocRef);
                        }

                        // 3. Delete Authentication
                        await deleteUser(currentUser);

                        // Force sign out just in case
                        // try { await signOut(); } catch (e) { /* ignore */ }

                      } catch (error: any) {
                        console.error("Error deleting account:", error);
                        if (error.code === 'auth/requires-recent-login') {
                          alert("For security, please log out and log back in before deleting your account.");
                          // Force logout immediately to help the user re-authenticate
                          await signOut();
                          window.location.reload();
                        } else {
                          alert("Failed to delete account. Please try again. " + error.message);
                        }
                      } finally {
                        // Ensure we clean up local state if the user was deleted or logged out
                        if (!user()) {
                          localStorage.clear();
                          sessionStorage.clear();
                          window.location.href = "/";
                        }
                      }
                    }}
                    class="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-medium rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Logout Section */}
              <div class="pt-4 pb-4">
                <button
                  onClick={() => signOut()}
                  class="w-full px-6 py-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded-xl transition-all duration-200 touch-manipulation active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                >
                  <HiSolidArrowRightOnRectangle class="w-5 h-5" aria-hidden="true" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </Show>
      </div >
    </main >
  );
}
