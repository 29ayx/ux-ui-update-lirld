import { createSignal } from "solid-js";

interface TermsConsentProps {
  onAccept: () => void;
}

/**
 * TermsConsent - Component for accepting Terms of Service and Privacy Policy
 * 
 * Features:
 * - Scrollable terms container with glassmorphism
 * - Checkbox for acceptance
 * - Links to full T&C and Privacy Policy pages
 * - Disabled continue button until checkbox is checked
 * - Dark theme with design system styling
 */
export default function TermsConsent(props: TermsConsentProps) {
  const [accepted, setAccepted] = createSignal(false);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (accepted()) {
      props.onAccept();
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      {/* Terms header */}
      <div class="text-center">
        <h2 class="text-2xl font-bold text-white mb-2">Terms & Conditions</h2>
        <p class="text-white/60 text-sm">
          Please review and accept our terms to continue
        </p>
      </div>

      {/* Scrollable terms container */}
      <div
        class="
          bg-[#1a1a1a] rounded-lg p-4
          border border-white/10
          max-h-64 overflow-y-auto
          backdrop-blur-xl
          scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent
        "
        role="region"
        aria-label="Terms and conditions summary"
        tabindex={0}
      >
        <div class="space-y-4 text-sm text-white/80 leading-relaxed">
          <p>
            By using <span class="font-semibold text-white">Lirld</span>, you agree to our Terms of Service and Privacy Policy.
          </p>
          
          <div class="space-y-2">
            <h3 class="font-semibold text-white text-base">Key Points:</h3>
            <ul class="space-y-2 list-disc list-inside text-white/70">
              <li>You must be 21 years or older to use this app</li>
              <li>You are responsible for maintaining account security</li>
              <li>We collect phone number, location, photos, and call logs</li>
              <li>Your data is stored securely and encrypted</li>
              <li>We do not share your data with third parties</li>
              <li>You can request data deletion at any time</li>
              <li>Inappropriate behavior may result in account termination</li>
              <li>Video calls are peer-to-peer and not recorded</li>
            </ul>
          </div>

          <p class="text-xs text-white/60 pt-2 border-t border-white/10">
            For complete details, please review the full documents linked below.
          </p>
        </div>
      </div>

      {/* Acceptance checkbox */}
      <label
        class="
          flex items-start gap-3 p-4
          bg-[#1a1a1a] rounded-lg
          border border-white/10
          cursor-pointer
          hover:border-white/20
          transition-colors duration-200
          touch-manipulation
        "
        for="terms-checkbox"
      >
        <input
          id="terms-checkbox"
          type="checkbox"
          checked={accepted()}
          onChange={(e) => setAccepted(e.currentTarget.checked)}
          class="
            mt-0.5 w-5 h-5 flex-shrink-0
            bg-[#111] border-2 border-white/30
            rounded
            checked:bg-[var(--c-calm)] checked:border-[var(--c-calm)]
            focus:outline-none focus:ring-2 focus:ring-[var(--c-calm)] focus:ring-offset-2 focus:ring-offset-black
            cursor-pointer
            transition-all duration-200
          "
          aria-required="true"
          aria-label="Accept terms and conditions"
        />
        <span class="text-sm text-white/80 leading-relaxed">
          I am 21 years or older and agree to the{" "}
          <a
            href="/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[var(--c-calm)] underline hover:text-[#3d8fd6] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Terms of Service
          </a>
          {" "}and{" "}
          <a
            href="/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[var(--c-calm)] underline hover:text-[#3d8fd6] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Privacy Policy
          </a>
        </span>
      </label>

      {/* Continue button */}
      <button
        type="submit"
        disabled={!accepted()}
        class="
          w-full h-12
          bg-[var(--c-calm)] hover:bg-[#3d8fd6]
          disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50
          text-white font-semibold
          rounded-lg
          transition-all duration-200
          touch-manipulation
          focus:outline-none focus:ring-2 focus:ring-[var(--c-calm)] focus:ring-offset-2 focus:ring-offset-black
        "
        aria-label="Continue after accepting terms"
      >
        Continue
      </button>

      {/* Helper text */}
      <p class="text-xs text-white/50 text-center">
        You can review these documents anytime in your account settings
      </p>
    </form>
  );
}
