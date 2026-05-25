import { createSignal, Show, onMount } from "solid-js";
import { calculateAge, isEligible } from "~/lib/auth/ageVerification";

interface AgeVerificationProps {
  onVerified: (birthdate: Date) => void;
  onBlocked: () => void;
}

/**
 * AgeVerification - Component for verifying user age (21+ requirement)
 * 
 * Features:
 * - Accessible date inputs with proper labels
 * - Real-time age calculation display
 * - Prominent 21+ requirement message
 * - Validation before allowing auth
 * - Blocking message for underage users
 * - Dark theme with glassmorphism
 */
export default function AgeVerification(props: AgeVerificationProps) {
  const [month, setMonth] = createSignal("");
  const [day, setDay] = createSignal("");
  const [year, setYear] = createSignal("");
  const [calculatedAge, setCalculatedAge] = createSignal<number | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [isBlocked, setIsBlocked] = createSignal(false);

  let monthInputRef: HTMLInputElement | undefined;

  // Auto-focus month input on mount
  onMount(() => {
    monthInputRef?.focus();
  });

  // Calculate age whenever date inputs change
  const updateAge = () => {
    const m = parseInt(month());
    const d = parseInt(day());
    const y = parseInt(year());

    if (!m || !d || !y) {
      setCalculatedAge(null);
      setError(null);
      return;
    }

    // Validate date
    if (m < 1 || m > 12) {
      setError("Invalid month");
      setCalculatedAge(null);
      return;
    }

    if (d < 1 || d > 31) {
      setError("Invalid day");
      setCalculatedAge(null);
      return;
    }

    const currentYear = new Date().getFullYear();
    if (y < 1900 || y > currentYear) {
      setError("Invalid year");
      setCalculatedAge(null);
      return;
    }

    // Create date and validate it's a real date
    const birthdate = new Date(y, m - 1, d);
    if (
      birthdate.getMonth() !== m - 1 ||
      birthdate.getDate() !== d ||
      birthdate.getFullYear() !== y
    ) {
      setError("Invalid date");
      setCalculatedAge(null);
      return;
    }

    setError(null);
    const age = calculateAge(birthdate);
    setCalculatedAge(age);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    const m = parseInt(month());
    const d = parseInt(day());
    const y = parseInt(year());

    if (!m || !d || !y) {
      setError("Please enter your complete birthdate");
      return;
    }

    const birthdate = new Date(y, m - 1, d);

    if (isEligible(birthdate)) {
      props.onVerified(birthdate);
    } else {
      setIsBlocked(true);
      props.onBlocked();
    }
  };

  const handleMonthInput = (e: InputEvent) => {
    const value = (e.target as HTMLInputElement).value.replace(/\D/g, "").slice(0, 2);
    setMonth(value);
    updateAge();

    // Auto-advance to day input when month is complete
    if (value.length === 2) {
      document.getElementById("year-input")?.focus();
    }
  };

  const handleDayInput = (e: InputEvent) => {
    const value = (e.target as HTMLInputElement).value.replace(/\D/g, "").slice(0, 2);
    setDay(value);
    updateAge();

    // Auto-advance to year input when day is complete
    if (value.length === 2) {
      document.getElementById("day-input")?.focus();
    }
  };

  const handleYearInput = (e: InputEvent) => {
    const value = (e.target as HTMLInputElement).value.replace(/\D/g, "").slice(0, 4);
    setYear(value);
    updateAge();
  };

  const isFormValid = () => {
    return month() && day() && year() && !error() && calculatedAge() !== null;
  };

  return (
    <Show
      when={!isBlocked()}
      fallback={
        <div
          class="bg-white dark:bg-[#1a1a1a] rounded-lg p-6 border border-[var(--c-alert)]/30 animate-in slide-in-from-bottom-4"
          role="alert"
          aria-live="assertive"
        >
          <div class="flex items-start gap-3">
            <div class="text-[var(--c-alert)] text-2xl flex-shrink-0">⚠️</div>
            <div>
              <h3 class="text-lg font-semibold text-black dark:text-white mb-2">
                Age Requirement Not Met
              </h3>
              <p class="text-black dark:text-white text-sm leading-relaxed">
                This app is restricted to users who are 21 years of age or older.
                Unfortunately, you do not meet this requirement and cannot create an account.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} class="space-y-6">
        {/* Age requirement notice */}
        <div
          class="bg-[var(--c-calm)]/10 border border-[var(--c-calm)]/30 rounded-lg text-black dark:text-white  p-4"
          role="note"
          aria-label="Age requirement"
        >
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xl">🔞</span>
            <h3 class="text-black dark:text-white font-semibold text-sm">Must be 21+</h3>
          </div>
          <p class="text-black dark:text-white text-xs">
            You must be at least 21 years old to use this app
          </p>
        </div>

        {/* Birthdate input - native date picker */}
        <div>
          <label for="birthdate-input" class="block text-sm font-medium text-black dark:text-white mb-3">
            Enter your birthdate (DD/MM/YYYY)
          </label>

          <input
            ref={monthInputRef}
            id="birthdate-input"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            min="1900-01-01"
            onChange={(e) => {
              const value = e.currentTarget.value;
              if (value) {
                const [y, m, d] = value.split('-');
                setYear(y);
                setMonth(m);
                setDay(d);
                updateAge();
              }
            }}
            class="
              w-full h-12 px-4
              bg-white dark:bg-[#1a1a1a] text-black dark:text-white
              border border-gray-200 dark:border-white/10 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[var(--c-calm)] focus:border-transparent
              touch-manipulation
              [color-scheme:dark]
            "
            aria-label="Birth date"
            aria-required="true"
            aria-invalid={error() !== null}
            autocomplete="bday"
          />

          {/* Error message */}
          <Show when={error()}>
            <div
              class="mt-2 text-xs text-[var(--c-error)] animate-in slide-in-from-top-1"
              role="alert"
              aria-live="polite"
            >
              {error()}
            </div>
          </Show>
        </div>

        {/* Age display */}
        <Show when={calculatedAge() !== null && !error()}>
          <div
            class="bg-white dark:bg-[#1a1a1a] rounded-lg p-4 border border-gray-200 dark:border-white/10 animate-in fade-in"
            role="status"
            aria-live="polite"
          >
            <div class="flex items-center justify-between">
              <span class="text-black dark:text-white text-sm">Your age:</span>
              <span
                class={`text-lg font-semibold ${calculatedAge()! >= 21
                  ? "text-[var(--c-online)]"
                  : "text-[var(--c-alert)]"
                  }`}
              >
                {calculatedAge()} years old
              </span>
            </div>
            <Show when={calculatedAge()! < 21}>
              <p class="text-xs text-[var(--c-alert)] mt-2">
                You must be 21 or older to continue
              </p>
            </Show>
          </div>
        </Show>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isFormValid()}
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
          aria-label="Continue to authentication"
        >
          Continue
        </button>

        {/* Helper text */}
        <p class="text-xs text-black dark:text-white text-center">
          Your birthdate is used for age verification only
        </p>
      </form>
    </Show>
  );
}
