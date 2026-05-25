import { createSignal, createMemo, onMount, onCleanup, Show, lazy } from 'solid-js';
import type { Country } from '~/lib/auth/countryData';
import { getCountryByCode } from '~/lib/auth/countryData';
import { validatePhoneNumber, type ValidationResult } from '~/lib/auth/phoneValidation';
import { formatWithCursor, stripFormatting } from '~/lib/auth/phoneFormatting';
import { detectCountry } from '~/lib/auth/countryDetection';

// Lazy load CountrySelector modal for better initial load performance
const CountrySelector = lazy(() => import('./CountrySelector').then(m => ({ default: m.CountrySelector })));

interface PhoneNumberInputProps {
  value: string;
  onInput: (value: string, e164?: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  autoDetectedCountry?: string;
  onCountryDetected?: (countryCode: string) => void;
}

export function PhoneNumberInput(props: PhoneNumberInputProps) {
  // State
  const [selectedCountry, setSelectedCountry] = createSignal<Country>(
    getCountryByCode(props.autoDetectedCountry || 'US') || {
      code: 'US',
      dialCode: '+1',
      name: 'United States',
      flag: '🇺🇸',
      format: '(###) ###-####',
      priority: 1
    }
  );
  const [isFocused, setIsFocused] = createSignal(false);
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = createSignal(false);
  const [validationResult, setValidationResult] = createSignal<ValidationResult>({ valid: false });
  const [debouncedValue, setDebouncedValue] = createSignal('');
  const [isDetectingCountry, setIsDetectingCountry] = createSignal(false);
  const [detectedCountryCode, setDetectedCountryCode] = createSignal<string | null>(null);

  let inputRef: HTMLInputElement | undefined;
  let debounceTimer: number | undefined;

  // Update selected country when autoDetectedCountry changes
  createMemo(() => {
    if (props.autoDetectedCountry) {
      const country = getCountryByCode(props.autoDetectedCountry);
      if (country) {
        setSelectedCountry(country);
      }
    }
  });

  // Validation state with debounce
  const performValidation = (value: string) => {
    if (!value || value.trim() === '') {
      setValidationResult({ valid: false });
      return;
    }

    const result = validatePhoneNumber(value, selectedCountry().code);
    setValidationResult(result);

    // Pass E.164 format to parent if valid
    if (result.valid && result.e164) {
      props.onInput(value, result.e164);
    }
  };

  // Debounced validation (300ms)
  const handleValidation = (value: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      setDebouncedValue(value);
      performValidation(value);
    }, 300) as unknown as number;
  };

  // Handle input changes with formatting
  const handleInput = (e: InputEvent) => {
    const target = e.currentTarget as HTMLInputElement;
    const cursorPosition = target.selectionStart || 0;
    const rawValue = target.value;

    // Strip to digits only for processing
    const digitsOnly = stripFormatting(rawValue);

    // Format with cursor position preservation
    const { formatted, cursorPosition: newCursorPosition } = formatWithCursor(
      digitsOnly,
      selectedCountry().code,
      cursorPosition
    );

    // Update input value
    target.value = formatted;

    // Restore cursor position
    setTimeout(() => {
      target.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);

    // Notify parent and trigger validation
    props.onInput(digitsOnly);
    handleValidation(digitsOnly);
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);

    // Re-validate with new country if there's a value
    if (props.value) {
      performValidation(props.value);
    }

    // Focus input after country selection
    setTimeout(() => {
      inputRef?.focus();
    }, 100);
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !props.disabled) {
      e.preventDefault();
      if (validationResult().valid) {
        props.onSubmit();
      }
    }
  };

  // Cleanup debounce timer
  onCleanup(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  });

  // Auto-detect country and focus on mount
  onMount(async () => {
    // Only detect if not already provided
    if (!props.autoDetectedCountry) {
      setIsDetectingCountry(true);

      try {
        const countryCode = await detectCountry();

        if (countryCode) {
          setDetectedCountryCode(countryCode);
          const country = getCountryByCode(countryCode);

          if (country) {
            setSelectedCountry(country);
            // Notify parent component
            props.onCountryDetected?.(countryCode);
          }
        }
      } catch (error) {
        console.warn('Country detection failed:', error);
      } finally {
        setIsDetectingCountry(false);
      }
    }

    // Focus input after detection completes
    setTimeout(() => {
      inputRef?.focus();
    }, 100);
  });

  // Computed validation state for UI
  const showValidation = createMemo(() => {
    return props.value.length > 0 && debouncedValue() === props.value;
  });

  const isValid = createMemo(() => {
    return showValidation() && validationResult().valid;
  });

  const hasError = createMemo(() => {
    return showValidation() && !validationResult().valid;
  });

  return (
    <div class="space-y-2">
      {/* Label */}
      <label for="phone-input" class="block text-sm font-medium text-slate-900">
        Phone Number
      </label>

      {/* Loading skeleton during country detection */}
      <Show when={isDetectingCountry()}>
        <div class="animate-pulse">
          <div class="h-12 bg-slate-900/10 rounded-lg" />
        </div>
      </Show>

      {/* Input container */}
      <Show when={!isDetectingCountry()}>
        <div>
          {/* Country selector button + Input field */}
          <div
            class={`flex items-center gap-2 bg-white rounded-lg border transition-all ${isFocused()
              ? 'border-blue-600'
              : hasError()
                ? 'border-red-600'
                : isValid()
                  ? 'border-green-600'
                  : 'border-slate-900/20'
              }`}
            style={{ 'min-height': '48px' }}
          >
            {/* Country selector button */}
            <button
              type="button"
              onClick={() => setIsCountrySelectorOpen(true)}
              disabled={props.disabled}
              class="flex items-center gap-1.5 px-2 py-3 hover:bg-slate-900/5 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none [-webkit-tap-highlight-color:transparent] flex-shrink-0"
              aria-label={`Selected country: ${selectedCountry().name}`}
              style={{ 'touch-action': 'manipulation', '-webkit-user-select': 'none', 'user-select': 'none' }}
            >
              {/* Flag */}
              <span class="text-xl" aria-hidden="true">
                {selectedCountry().flag}
              </span>

              {/* Dropdown arrow */}
              <svg
                class="w-3 h-3 text-slate-900/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Divider */}
            <div class="h-6 w-px bg-slate-900/10" aria-hidden="true" />

            {/* Phone input */}
            <input
              ref={inputRef}
              id="phone-input"
              type="tel"
              inputMode="tel"
              autocomplete="tel"
              value={props.value}
              onInput={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              disabled={props.disabled}
              placeholder={selectedCountry().format.replace(/#/g, '0')}
              class="flex-1 px-3 py-3 bg-transparent text-black placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
              aria-label="Phone number"
              aria-invalid={hasError()}
              aria-describedby={hasError() ? 'phone-error' : undefined}
              aria-required="true"
              style={{ 'touch-action': 'manipulation', '-webkit-user-select': 'text', 'user-select': 'text' }}
            />

            {/* Validation icon */}
            <Show when={showValidation()}>
              <div class="px-3" aria-hidden="true">
                <Show
                  when={isValid()}
                  fallback={
                    <Show when={hasError()}>
                      <svg
                        class="w-5 h-5 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </Show>
                  }
                >
                  <svg
                    class="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </Show>
              </div>
            </Show>
          </div>

          {/* Error message only */}
          <Show when={hasError() && validationResult().error}>
            <div
              id="phone-error"
              role="alert"
              aria-live="polite"
              class="text-xs text-red-600 flex items-start gap-1.5 mt-2"
            >
              <svg
                class="w-4 h-4 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{validationResult().error}</span>
            </div>
          </Show>
        </div>
      </Show>

      {/* Country selector modal */}
      <CountrySelector
        selectedCountry={selectedCountry()}
        onSelect={handleCountrySelect}
        autoDetectedCountry={detectedCountryCode() || props.autoDetectedCountry}
        isOpen={isCountrySelectorOpen()}
        onClose={() => setIsCountrySelectorOpen(false)}
      />
    </div>
  );
}
