import { createSignal, Show, For, onMount, createMemo } from "solid-js";
import { useAuth } from "~/lib/auth";
import { db } from "~/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import AuthContainer from "./auth/AuthContainer";
import PhotoManager from "./PhotoManager";
import { detectLocation } from "~/lib/auth/locationDetection";
import { calculateAge } from "~/lib/auth/ageVerification";
import { IoMale, IoFemale } from 'solid-icons/io';

interface ProfileData {
  name: string;
  email: string;
  photoURL: string;
  dob: string;
  photos: string[];
  language: string;
  country: string;
  city?: string;
  gender: string;
}

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian",
  "Portuguese", "Russian", "Chinese", "Japanese", "Korean",
  "Hindi", "Arabic", "Dutch", "Swedish", "Turkish", "Other"
];

export default function ProfileSetup(props: { onComplete: () => void }) {
  const { user, signOut } = useAuth();
  const [currentStep, setCurrentStep] = createSignal(0);
  const [profileData, setProfileData] = createSignal<Partial<ProfileData>>({
    photos: [],
    gender: ""
  });
  const [error, setError] = createSignal("");
  const [saving, setSaving] = createSignal(false);
  const [birthdate, setBirthdate] = createSignal<Date | null>(null);

  // Dynamic color scheme based on gender selection (aligned with Blue theme)
  const themeColors = createMemo(() => {
    const gender = profileData().gender?.toLowerCase();
    if (gender === "female") {
      return {
        primary: "#3B82F6", // blue-500
        primaryHover: "#2563EB", // blue-600
        primaryLight: "rgba(59, 130, 241, 0.08)",
        primaryBorder: "rgba(59, 130, 241, 0.2)",
        shadow: "rgba(59, 130, 241, 0.2)"
      };
    } else if (gender === "male") {
      return {
        primary: "#2563EB", // blue-600
        primaryHover: "#1D4ED8", // blue-700
        primaryLight: "rgba(37, 99, 235, 0.08)",
        primaryBorder: "rgba(37, 99, 235, 0.2)",
        shadow: "rgba(37, 99, 235, 0.2)"
      };
    }
    // Default (no selection)
    return {
      primary: "#2563EB", // blue-600
      primaryHover: "#1D4ED8",
      primaryLight: "rgba(255, 255, 255, 0.03)",
      primaryBorder: "rgba(255, 255, 255, 0.1)",
      shadow: "rgba(37, 99, 235, 0.1)"
    };
  });

  // Auto-detect location and pre-fill from Google on mount
  onMount(async () => {
    const currentUser = user();
    if (!currentUser) return;

    // Do NOT set a default birthdate. 
    // If we can't get it from Google, we shouldn't guess.

    setBirthdate(null);

    const googleData: Partial<ProfileData> = {
      name: currentUser.displayName || "User",
      email: currentUser.email || "",
      photoURL: "",
      photos: [],
      dob: "", // Leave empty, let user fill or remain unset
      language: "English", // Default to English
      country: "",
      city: ""
    };

    // Auto-detect location
    try {
      const location = await detectLocation();
      if (location) {
        googleData.country = location.country;
        googleData.city = location.city;
      }
    } catch (err) {
      console.error("Failed to detect location:", err);
    }

    setProfileData(googleData);
  });

  const steps = [
    { id: "gender", title: "Gender", subtitle: "How you identify yourself?" },
    { id: "photos", title: "Add Photos", subtitle: "Upload at least 1 photo" }
  ];

  const handleNext = async () => {
    const stepIndex = currentStep();
    const currentStepId = steps[stepIndex].id;

    // Validation
    if (currentStepId === "gender") {
      if (!profileData().gender) {
        setError("Please select your gender");
        return;
      }
    } else if (currentStepId === "photos") {
      const photos = profileData().photos || [];
      if (photos.length < 1) {
        setError("Please add at least 1 photo");
        return;
      }
    }

    setError("");

    if (stepIndex === steps.length - 1) {
      await handleSave();
    } else {
      setCurrentStep(stepIndex + 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const currentUser = user();
      if (!currentUser) {
        setError("User not found. Please try logging in again.");
        setSaving(false);
        return;
      }

      const finalData = profileData();

      // Validate all required fields
      // Validate required fields (Removed dob check)
      if (!finalData.name || !finalData.gender || !finalData.language ||
        !finalData.photos || finalData.photos.length < 1) {
        setError("Please complete all fields");
        setSaving(false);
        return;
      }

      // Calculate age only if we have a DOB
      let dobDate: Date | null = null;
      let calculatedAge: number | null = null;

      if (finalData.dob) {
        dobDate = new Date(finalData.dob);
        calculatedAge = calculateAge(dobDate);
      }

      const userData = {
        name: finalData.name,
        email: finalData.email || currentUser.email,
        photoURL: finalData.photoURL,
        dob: finalData.dob || null,
        birthdate: dobDate,
        age: calculatedAge,
        gender: finalData.gender,
        photos: finalData.photos,
        language: finalData.language,
        country: finalData.country,
        city: finalData.city,
        uid: currentUser.uid,
        createdAt: new Date().toISOString(),
        profileCompleted: true,
        showBirthdayCard: false, // Hidden by default for new users
        // Default settings
        visibility: {
          age: true,
          location: true
        },
        customization: {
          room: JSON.stringify({ theme: "simple" }),
        }
      };

      await setDoc(doc(db, "users", currentUser.uid), userData);



      props.onComplete();
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save profile. Please try again.");
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep() > 0) {
      setCurrentStep(currentStep() - 1);
      setError("");
    }
  };

  const currentStepData = createMemo(() => steps[currentStep()]);
  const progress = createMemo(() => ((currentStep() + 1) / steps.length) * 100);

  return (
    <AuthContainer
      title={currentStepData().title}
      subtitle={currentStepData().subtitle}
    >
      {/* Progress bar */}
      <div class="mb-8">
        <div class="flex justify-between mb-2">
          <span class="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            Step {currentStep() + 1} of {steps.length}
          </span>
          <span class="text-zinc-500 text-xs font-bold">{Math.round(progress())}%</span>
        </div>
        <div class="w-full bg-white/5 rounded-full h-2 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
            style={`width: ${progress()}%`}
          />
        </div>
      </div>

      {/* Error display */}
      <Show when={error()}>
        <div
          class="bg-[#FF375F]/10 border border-[#FF375F]/30 text-[#FF375F] px-4 py-3 rounded-2xl mb-6 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 backdrop-blur-md"
          role="alert"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="font-medium">{error()}</span>
        </div>
      </Show>

      {/* Step content */}
      <div class="space-y-6">

        {/* Gender Step */}
        <Show when={currentStepData().id === "gender"}>
          <div class="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Male Button */}
              <button
                type="button"
                onClick={() => {
                  setProfileData(prev => ({ ...prev, gender: "Male" }));
                  setError("");
                }}
                style={profileData().gender === "Male" ? `border-color: ${themeColors().primary}; background-color: ${themeColors().primaryLight}` : ""}
                class={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 touch-manipulation hover:scale-105 active:scale-[0.98] ${profileData().gender === "Male"
                  ? ""
                  : "bg-transparent border-white/10 hover:border-blue-500/30"
                  }`}
              >
                <div
                  style={profileData().gender === "Male" ? `background-color: ${themeColors().primary}` : ""}
                  class={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${profileData().gender === "Male"
                    ? "text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                    : "bg-white/5 text-white/40"
                    }`}>
                  <IoMale class="w-7 h-7" />
                </div>
                <span
                  style={profileData().gender === "Male" ? `color: ${themeColors().primary}` : ""}
                  class={`font-bold transition-colors ${profileData().gender === "Male"
                    ? ""
                    : "text-white/60"
                    }`}>Male</span>
                <div class="absolute inset-x-0 bottom-0 h-1 bg-blue-500/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-b-2xl" />
              </button>

              {/* Female Button */}
              <button
                type="button"
                onClick={() => {
                  setProfileData(prev => ({ ...prev, gender: "Female" }));
                  setError("");
                }}
                style={profileData().gender === "Female" ? `border-color: ${themeColors().primary}; background-color: ${themeColors().primaryLight}` : ""}
                class={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 touch-manipulation hover:scale-105 active:scale-[0.98] ${profileData().gender === "Female"
                  ? ""
                  : "bg-transparent border-white/10 hover:border-blue-400/30"
                  }`}
              >
                <div
                  style={profileData().gender === "Female" ? `background-color: ${themeColors().primary}` : ""}
                  class={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${profileData().gender === "Female"
                    ? "text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    : "bg-white/5 text-white/40"
                    }`}>
                  <IoFemale class="w-7 h-7" />
                </div>
                <span
                  style={profileData().gender === "Female" ? `color: ${themeColors().primary}` : ""}
                  class={`font-bold transition-colors ${profileData().gender === "Female"
                    ? ""
                    : "text-white/60"
                    }`}>Female</span>
                <div class="absolute inset-x-0 bottom-0 h-1 bg-blue-400/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-b-2xl" />
              </button>
            </div>


            <button
              onClick={handleNext}
              disabled={!profileData().gender}
              class="w-full mt-6 disabled:bg-transparent disabled:border-white/10 disabled:border-2 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all duration-200 focus:outline-none hover:scale-105 active:scale-[0.98] touch-manipulation text-lg bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
            >
              Next Step
            </button>
          </div>
        </Show>

        {/* Name Step */}


        {/* Photos Step */}
        <Show when={currentStepData().id === "photos"}>
          <div class="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div class="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20">
              <p class="text-blue-300 text-sm font-medium flex items-start gap-2">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Upload a clear photo of yourself to get more profile views and interactions.</span>
              </p>
            </div>

            <PhotoManager
              photos={profileData().photos || []}
              userId={user()?.uid || "temp"}
              onPhotosChange={(photos) => {
                setProfileData(prev => ({
                  ...prev,
                  photos,
                  photoURL: photos.length > 0 ? photos[0] : ""
                }));
                setError("");
              }}
              maxPhotos={4}
            />

            {/* Bottom Actions Sticky for Photo Step */}
            <div class="fixed bottom-0 inset-x-0 p-4 bg-[#02071B]/95 border-t border-white/5 z-50 flex gap-3 sm:static sm:bg-transparent sm:border-0 sm:p-0">
              <button
                onClick={handleBack}
                disabled={saving()}
                class="flex-1 border-2 border-white/10 bg-transparent hover:bg-white/5 text-white font-bold py-4 rounded-2xl transition-all hover:scale-105 active:scale-[0.98] disabled:opacity-50 touch-manipulation"
              >
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!profileData().photos || (profileData().photos?.length ?? 0) < 1 || saving()}
                class="flex-[2] disabled:bg-transparent disabled:border-white/10 disabled:border-2 disabled:text-zinc-600 text-white font-bold py-4 rounded-2xl transition-all duration-200 focus:outline-none hover:scale-105 active:scale-[0.98] touch-manipulation text-lg bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
              >
                <Show when={saving()} fallback="Complete Profile">
                  <span class="flex items-center justify-center gap-2">
                    <svg
                      class="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                </Show>
              </button>
            </div>

            {/* Spacer for sticky bottom bar on mobile */}
            <div class="h-24 sm:hidden" />
          </div>
        </Show>

        {/* Language Step */}

      </div>
    </AuthContainer>
  );
}
