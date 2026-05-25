import { createSignal, Show } from "solid-js";
import { requestMicrophonePermission, storeMicrophonePermissionStatus, type PermissionRequestResult } from "~/lib/permissions";

interface MicrophonePermissionRequestProps {
  userId: string;
  onComplete: (result: PermissionRequestResult) => void;
}

export default function MicrophonePermissionRequest(props: MicrophonePermissionRequestProps) {
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleRequestPermission = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await requestMicrophonePermission();
      
      // Store permission status in user preferences
      await storeMicrophonePermissionStatus(props.userId, result.status, false);
      
      props.onComplete(result);
    } catch (err) {
      console.error('Error requesting microphone permission:', err);
      setError('Failed to request permission. Please try again.');
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Store that user skipped permission request
      await storeMicrophonePermissionStatus(props.userId, 'prompt', true);
      
      props.onComplete({
        granted: false,
        status: 'prompt',
        skipped: true
      });
    } catch (err) {
      console.error('Error storing skip status:', err);
      setError('Failed to save preference. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div class="space-y-6 fade-in">
      {/* Icon */}
      <div class="flex justify-center">
        <div class="w-20 h-20 bg-[var(--c-calm)]/20 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-[var(--c-calm)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </div>

      {/* Title and Description */}
      <div class="text-center space-y-2">
        <h3 class="text-xl font-semibold text-white">
          Enable Microphone Access
        </h3>
        <p class="text-sm text-white/70 leading-relaxed">
          To make video calls, we need access to your microphone. 
          Your browser will ask for permission when you click "Allow Access" below.
        </p>
      </div>

      {/* Why we need this */}
      <div class="bg-[#1a1a1a] rounded-lg p-4 space-y-3">
        <h4 class="text-sm font-medium text-white flex items-center gap-2">
          <svg class="w-4 h-4 text-[var(--c-calm)]" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          Why we need this
        </h4>
        <ul class="text-xs text-white/60 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-[var(--c-calm)] mt-0.5">•</span>
            <span>Make voice and video calls with other users</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-[var(--c-calm)] mt-0.5">•</span>
            <span>Communicate during live conversations</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-[var(--c-calm)] mt-0.5">•</span>
            <span>Your microphone is only active during calls</span>
          </li>
        </ul>
      </div>

      {/* Error Display */}
      <Show when={error()}>
        <div
          role="alert"
          aria-live="polite"
          class="bg-[var(--c-alert)]/20 border border-[var(--c-alert)]/50 text-[var(--c-error)] px-4 py-3 rounded-lg text-sm flex items-start gap-2"
        >
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{error()}</span>
        </div>
      </Show>

      {/* Action Buttons */}
      <div class="space-y-3">
        <button
          onClick={handleRequestPermission}
          disabled={loading()}
          class="w-full bg-[var(--c-calm)] hover:bg-[#3d8fd6] active:scale-[0.98] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--c-calm)] focus:ring-offset-2 focus:ring-offset-[#111] touch-manipulation min-h-[48px]"
        >
          <Show when={loading()} fallback="Allow Access">
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
              Processing...
            </span>
          </Show>
        </button>

        <button
          onClick={handleSkip}
          disabled={loading()}
          class="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-lg transition-all duration-200 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--c-calm)] focus:ring-offset-2 focus:ring-offset-[#111] touch-manipulation min-h-[48px]"
        >
          Skip for now
        </button>

        <p class="text-xs text-white/50 text-center">
          You can enable this later in your settings
        </p>
      </div>

      {/* Warning for skipping */}
      <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <p class="text-xs text-yellow-200/80 flex items-start gap-2">
          <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>
            If you skip this step, you won't be able to make or receive calls until you grant microphone access.
          </span>
        </p>
      </div>
    </div>
  );
}
