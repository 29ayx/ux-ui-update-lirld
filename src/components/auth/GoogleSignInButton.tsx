import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "~/lib/auth";
import type { User } from "firebase/auth";

interface GoogleSignInButtonProps {
  onError?: (error: { code: string; message: string; userFriendly: string }) => void;
  onSuccess?: (user: User) => void;
  disabled?: boolean;
}

export default function GoogleSignInButton(props: GoogleSignInButtonProps) {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();

      // Call onSuccess callback with the authenticated user
      const currentUser = user();
      if (currentUser && props.onSuccess) {
        props.onSuccess(currentUser);
      }

      // Redirect to home page after successful authentication
      navigate("/");
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string };
      const code = firebaseError?.code || "unknown";
      const message = firebaseError?.message || "An unexpected error occurred";

      // Map Firebase error codes to user-friendly messages
      const errorMap: Record<string, string> = {
        "auth/popup-closed-by-user": "Sign-in was cancelled. Please try again.",
        "auth/popup-blocked": "Popup was blocked. Please allow popups for this site.",
        "auth/network-request-failed": "Network error. Please check your connection and try again.",
        "auth/internal-error": "An internal error occurred. Please try again.",
        "auth/cancelled-popup-request": "Sign-in was cancelled. Please try again.",
        "auth/account-exists-with-different-credential": "An account already exists with this email.",
      };

      const error = {
        code,
        message,
        userFriendly: errorMap[code] || "Something went wrong. Please try again.",
      };

      props.onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={props.disabled || loading()}
      class="w-full bg-white dark:bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-900 font-black py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-4 border-2 border-transparent shadow-2xl hover:shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 touch-manipulation min-h-[56px] text-lg lg:text-xl"
      aria-label="Sign in with Google"
    >
      <Show
        when={loading()}
        fallback={
          <>
            <svg class="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign in with Google</span>
          </>
        }
      >
        <span class="flex items-center justify-center gap-2">
          <svg
            class="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
          Signing in...
        </span>
      </Show>
    </button>
  );
}
