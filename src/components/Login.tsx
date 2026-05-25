import { createSignal, Show, onMount, onCleanup } from "solid-js";
import { useAuth } from "~/lib/auth";
import AuthContainer from "./auth/AuthContainer";
import TermsConsent from "./auth/TermsConsent";
import MicrophonePermissionRequest from "./auth/MicrophonePermissionRequest";
import GoogleSignInButton from "./auth/GoogleSignInButton";
import { AuthErrorDisplay } from "./auth/AuthErrorDisplay";
import { mapAuthError, type AuthError } from "~/lib/auth/authErrors";
import { detectLocation, storeUserLocation } from "~/lib/auth/locationDetection";
import type { PermissionRequestResult } from "~/lib/permissions";
import { IoShieldCheckmark, IoVideocam, IoEarth } from "solid-icons/io";

// Auth flow steps
type AuthFlowStep = 'auth' | 'terms' | 'permissions' | 'complete';

export default function Login() {
  const { user } = useAuth();

  // Flow state management
  const [currentStep, setCurrentStep] = createSignal<AuthFlowStep>('auth');
  const [detectedLocationData, setDetectedLocationData] = createSignal<any>(null);
  const [error, setError] = createSignal<AuthError | null>(null);
  const [loading, setLoading] = createSignal(false);

  // Creative Rotating Taglines
  const [taglineIndex, setTaglineIndex] = createSignal(0);
  const taglines = [
    "Connect instantly with the world",
    "Share unlimited moments for free",
    "Discover verified hosts globally",
    "Your privacy, our priority"
  ];

  onMount(() => {
    // Tagline rotation
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 3000);

    // Auto-detect location
    detectLocation().then(location => {
      if (location) {
        setDetectedLocationData(location);
      }
    });

    onCleanup(() => clearInterval(interval));
  });

  // Flow transition handlers
  const handleAuthComplete = async () => {
    const currentUser = user();
    if (currentUser && detectedLocationData()) {
      try {
        await storeUserLocation(currentUser.uid, detectedLocationData());
      } catch (err) {
        console.error('Failed to store user location:', err);
      }
    }
    setCurrentStep('terms');
    setError(null);
  };

  const handleTermsAccepted = () => {
    setCurrentStep('permissions');
  };

  const handlePermissionComplete = (result: PermissionRequestResult) => {
    setCurrentStep('complete');
    if (!result.granted && !result.skipped) {
      console.warn('Microphone permission denied.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      await handleAuthComplete();
    } catch (err) {
      const authError = mapAuthError(err);
      setError(authError);
    } finally {
      setLoading(false);
    }
  };

  // Determine title and subtitle based on current step
  const getTitle = () => {
    switch (currentStep()) {
      case 'auth': return 'Welcome';
      case 'terms': return 'Terms & Conditions';
      case 'permissions': return 'Microphone Access';
      default: return 'Welcome';
    }
  };

  const getSubtitle = () => {
    switch (currentStep()) {
      case 'auth': return taglines[taglineIndex()];
      case 'terms': return 'Please review and accept our terms';
      case 'permissions': return 'Required for making calls';
      default: return '';
    }
  };

  return (
    <AuthContainer title={getTitle()} subtitle={getSubtitle()}>
      {/* Auth Step (Google) */}
      <Show when={currentStep() === 'auth'}>
        <div class="space-y-10">
          {/* Feature Highlights - The "Sense of the App" */}
          <div class="grid grid-cols-1 gap-4">
            <div class="group p-4 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 transition-all hover:scale-[1.02] hover:bg-white dark:hover:bg-zinc-900">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
                  <IoVideocam size={24} />
                </div>
                <div>
                  <h3 class="text-sm font-black uppercase tracking-wider mb-1">Free Unlimited Calls</h3>
                  <p class="text-xs text-gray-500 dark:text-zinc-400 font-medium">Connect with anyone, anywhere without ever worrying about limits or surprise charges.</p>
                </div>
              </div>
            </div>

            <div class="group p-4 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 transition-all hover:scale-[1.02] hover:bg-white dark:hover:bg-zinc-900" style="transition-delay: 100ms">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-600 shrink-0">
                  <IoEarth size={24} />
                </div>
                <div>
                  <h3 class="text-sm font-black uppercase tracking-wider mb-1">Global Discovery</h3>
                  <p class="text-xs text-gray-500 dark:text-zinc-400 font-medium">Meet verified hosts from over 50+ countries. Real people, real connections, instantly.</p>
                </div>
              </div>
            </div>

            <div class="group p-4 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 transition-all hover:scale-[1.02] hover:bg-white dark:hover:bg-zinc-900" style="transition-delay: 200ms">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <IoShieldCheckmark size={24} />
                </div>
                <div>
                  <h3 class="text-sm font-black uppercase tracking-wider mb-1">Privacy Focused</h3>
                  <p class="text-xs text-gray-500 dark:text-zinc-400 font-medium">Your data stays yours. End-to-end encrypted chats and secure video infrastructure.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Massive Google CTA */}
          <div class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-pink-500 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div class="relative">
              <AuthErrorDisplay error={error()} onDismiss={() => setError(null)} />
              <div class="flex flex-col gap-3">
                <GoogleSignInButton
                  onError={(err) => setError(mapAuthError(err))}
                  onSuccess={handleGoogleLogin}
                  disabled={loading()}
                />
                <p class="text-[10px] text-center text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                  One-tap secure access
                </p>
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Terms & Conditions Step */}
      <Show when={currentStep() === 'terms'}>
        <div class="w-full max-w-md mx-auto">
          <TermsConsent onAccept={handleTermsAccepted} />
        </div>
      </Show>

      {/* Microphone Permission Step */}
      <Show when={currentStep() === 'permissions'}>
        <div class="w-full max-w-md mx-auto">
          <Show when={user()}>
            {(currentUser) => (
              <MicrophonePermissionRequest
                userId={currentUser().uid}
                onComplete={handlePermissionComplete}
              />
            )}
          </Show>
        </div>
      </Show>
    </AuthContainer>
  );
}
