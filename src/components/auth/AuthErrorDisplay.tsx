import { Show, createEffect, onCleanup } from 'solid-js';
import type { Component } from 'solid-js';

export interface AuthError {
  code: string;
  message: string;
  userFriendly: string;
  retryable: boolean;
}

interface AuthErrorDisplayProps {
  error: AuthError | null;
  onDismiss?: () => void;
}

/**
 * AuthErrorDisplay Component
 * 
 * Displays authentication errors with proper accessibility attributes,
 * error icon, and slide-in animation. Supports optional dismiss functionality.
 * 
 * @param props.error - The error object to display (null to hide)
 * @param props.onDismiss - Optional callback when dismiss button is clicked
 */
export const AuthErrorDisplay: Component<AuthErrorDisplayProps> = (props) => {
  let containerRef: HTMLDivElement | undefined;

  // Auto-dismiss after 10 seconds if dismissible
  createEffect(() => {
    if (props.error && props.onDismiss) {
      const timer = setTimeout(() => {
        props.onDismiss?.();
      }, 10000);

      onCleanup(() => clearTimeout(timer));
    }
  });

  return (
    <Show when={props.error}>
      <div
        ref={containerRef}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        class="slide-in-from-top animate-in"
        style={{
          animation: 'slide-in-from-top 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div
          class="flex items-start gap-3 p-4 rounded-lg border"
          style={{
            'background-color': 'var(--c-alert)',
            'border-color': 'rgba(255, 255, 255, 0.1)',
            color: 'white'
          }}
        >
          {/* Error Icon - Exclamation Triangle */}
          <div class="flex-shrink-0 mt-0.5" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 6V10M10 14H10.01M4.93 16H15.07C16.14 16 16.86 14.88 16.36 13.95L11.29 4.95C10.79 4.02 9.21 4.02 8.71 4.95L3.64 13.95C3.14 14.88 3.86 16 4.93 16Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          {/* Error Message */}
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium leading-relaxed">
              {props.error?.userFriendly || 'An error occurred. Please try again.'}
            </p>
          </div>

          {/* Optional Dismiss Button */}
          <Show when={props.onDismiss}>
            <button
              type="button"
              onClick={() => props.onDismiss?.()}
              class="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
              style={{
                'focus:ring-offset-color': 'var(--c-alert)'
              }}
              aria-label="Dismiss error"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </Show>
        </div>
      </div>
    </Show>
  );
};
