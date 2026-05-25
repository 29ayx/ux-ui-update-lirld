import { createSignal, Show, onMount, onCleanup, createEffect } from "solid-js";
import { sanitizeCodeInput, maskPhoneNumber, formatVerificationCode } from "~/lib/auth/inputSanitization";

interface VerificationCodeInputProps {
  phoneNumber: string;
  value: string;
  onInput: (value: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  onBack: () => void;
  disabled?: boolean;
  error?: string | null;
  loading?: boolean;
}

export default function VerificationCodeInput(props: VerificationCodeInputProps) {
  const [countdown, setCountdown] = createSignal(60);
  const [canResend, setCanResend] = createSignal(false);
  const [shake, setShake] = createSignal(false);
  let inputRef: HTMLInputElement | undefined;
  let countdownInterval: number | undefined;

  // Start countdown timer on mount
  onMount(() => {
    startCountdown();
    // Auto-focus input
    inputRef?.focus();
  });

  // Cleanup interval on unmount
  onCleanup(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  });

  // Trigger shake animation when error changes
  createEffect(() => {
    if (props.error) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  });

  const startCountdown = () => {
    setCountdown(60);
    setCanResend(false);
    
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as unknown as number;
  };

  const handleInput = (value: string) => {
    // Sanitize input (only digits, max 6)
    const sanitized = sanitizeCodeInput(value);
    props.onInput(sanitized);
    
    // Auto-submit when 6 digits entered
    if (sanitized.length === 6) {
      setTimeout(() => {
        props.onSubmit();
      }, 100);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData?.getData("text") || "";
    // Extract only digits from pasted text
    const digits = pastedText.replace(/\D/g, "").slice(0, 6);
    handleInput(digits);
  };

  const handleResend = async () => {
    if (!canResend() || props.disabled) return;
    
    await props.onResend();
    startCountdown();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && props.value.length === 6) {
      e.preventDefault();
      props.onSubmit();
    }
  };

  return (
    <div class="space-y-6 fade-in">
      {/* Masked phone number display */}
      <div class="text-center">
        <p class="text-sm text-white/60 mb-1">Code sent to</p>
        <p class="text-base font-medium text-white">{maskPhoneNumber(props.phoneNumber)}</p>
      </div>

      {/* Verification code input */}
      <div>
        <label for="verification-code" class="block text-sm font-medium text-white mb-2">
          Enter 6-digit code
        </label>
        <input
          ref={inputRef}
          id="verification-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autocomplete="one-time-code"
          placeholder="000 000"
          value={formatVerificationCode(props.value)}
          onInput={(e) => handleInput(e.currentTarget.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          disabled={props.disabled || props.loading}
          aria-invalid={!!props.error}
          aria-describedby={props.error ? "code-error" : "code-help"}
          aria-label="Verification code"
          class={`
            w-full px-4 py-3 bg-[#1a1a1a] border rounded-lg
            text-white text-center text-2xl tracking-widest placeholder:text-white/30
            focus:outline-none focus:ring-2 focus:ring-[var(--c-calm)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 touch-manipulation
            ${props.error ? "border-[var(--c-error)]/50" : "border-white/10"}
            ${shake() ? "animate-shake" : ""}
          `}
          maxLength={7}
        />
        <p id="code-help" class="mt-2 text-xs text-white/50 text-center">
          Code will auto-submit when complete
        </p>
        <Show when={props.error}>
          <p
            id="code-error"
            role="alert"
            aria-live="polite"
            class="mt-2 text-xs text-[var(--c-error)] text-center"
          >
            {props.error}
          </p>
        </Show>
      </div>

      {/* Resend code button */}
      <div class="text-center">
        <Show
          when={canResend()}
          fallback={
            <p class="text-sm text-white/50">
              Resend code in <span class="font-medium text-white">{countdown()}s</span>
            </p>
          }
        >
          <button
            type="button"
            onClick={handleResend}
            disabled={props.disabled || props.loading}
            class="text-sm text-[var(--c-calm)] hover:text-[#3d8fd6] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:underline"
          >
            Resend code
          </button>
        </Show>
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={props.onSubmit}
        disabled={props.value.length !== 6 || props.disabled || props.loading}
        class="w-full bg-[var(--c-calm)] hover:bg-[#3d8fd6] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--c-calm)] focus:ring-offset-2 focus:ring-offset-[#111] touch-manipulation min-h-[48px]"
      >
        <Show when={props.loading} fallback="Verify Code">
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
            Verifying...
          </span>
        </Show>
      </button>

      {/* Back button */}
      <button
        type="button"
        onClick={props.onBack}
        disabled={props.disabled || props.loading}
        class="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition-all duration-200 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--c-calm)] focus:ring-offset-2 focus:ring-offset-[#111] touch-manipulation min-h-[48px]"
      >
        ← Back to phone number
      </button>
    </div>
  );
}
