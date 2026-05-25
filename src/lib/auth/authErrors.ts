/**
 * Auth Error Handling
 * 
 * Provides comprehensive error mapping for Firebase authentication errors,
 * age verification errors, and blocked user errors.
 */

export interface AuthError {
  code: string;
  message: string;
  userFriendly: string;
  retryable: boolean;
}

/**
 * Comprehensive Firebase Auth error messages
 * Maps Firebase error codes to user-friendly messages
 */
export const AUTH_ERROR_MESSAGES: Record<string, { message: string; retryable: boolean }> = {
  // Phone authentication errors
  'auth/invalid-phone-number': {
    message: 'Please enter a valid phone number with country code',
    retryable: true,
  },
  'auth/missing-phone-number': {
    message: 'Phone number is required',
    retryable: true,
  },
  'auth/quota-exceeded': {
    message: 'SMS quota exceeded. Please try again later',
    retryable: false,
  },
  'auth/user-disabled': {
    message: 'This account has been disabled',
    retryable: false,
  },
  
  // Verification code errors
  'auth/invalid-verification-code': {
    message: 'Invalid code. Please try again',
    retryable: true,
  },
  'auth/invalid-verification-id': {
    message: 'Verification session expired. Please request a new code',
    retryable: true,
  },
  'auth/code-expired': {
    message: 'Code expired. Request a new one',
    retryable: true,
  },
  'auth/session-expired': {
    message: 'Session expired. Please start over',
    retryable: true,
  },
  
  // Rate limiting errors
  'auth/too-many-requests': {
    message: 'Too many attempts. Try again in 15 minutes',
    retryable: false,
  },
  'auth/rate-limit-exceeded': {
    message: 'Too many verification attempts. Please try again later',
    retryable: false,
  },
  
  // reCAPTCHA errors
  'auth/captcha-check-failed': {
    message: 'reCAPTCHA failed. Refresh and try again',
    retryable: true,
  },
  'auth/missing-app-credential': {
    message: 'reCAPTCHA verification failed. Please refresh the page',
    retryable: true,
  },
  'auth/invalid-app-credential': {
    message: 'reCAPTCHA verification failed. Please refresh the page',
    retryable: true,
  },
  
  // Network errors
  'auth/network-request-failed': {
    message: 'Network error. Check your connection and try again',
    retryable: true,
  },
  'auth/timeout': {
    message: 'Request timed out. Please try again',
    retryable: true,
  },
  
  // Google OAuth errors
  'auth/popup-closed-by-user': {
    message: 'Sign-in was cancelled. Please try again',
    retryable: true,
  },
  'auth/popup-blocked': {
    message: 'Popup was blocked. Please allow popups for this site',
    retryable: true,
  },
  'auth/cancelled-popup-request': {
    message: 'Sign-in was cancelled. Please try again',
    retryable: true,
  },
  'auth/account-exists-with-different-credential': {
    message: 'An account already exists with this email using a different sign-in method',
    retryable: true,
  },
  'auth/auth-domain-config-required': {
    message: 'Authentication configuration error. Please contact support',
    retryable: false,
  },
  'auth/credential-already-in-use': {
    message: 'This credential is already associated with a different account',
    retryable: false,
  },
  'auth/operation-not-allowed': {
    message: 'This sign-in method is not enabled. Please contact support',
    retryable: false,
  },
  'auth/unauthorized-domain': {
    message: 'This domain is not authorized for authentication',
    retryable: false,
  },
  
  // Internal errors
  'auth/internal-error': {
    message: 'An internal error occurred. Please try again',
    retryable: true,
  },
  'auth/invalid-api-key': {
    message: 'Authentication configuration error. Please contact support',
    retryable: false,
  },
  'auth/app-deleted': {
    message: 'Authentication service unavailable. Please contact support',
    retryable: false,
  },
  'auth/app-not-authorized': {
    message: 'This app is not authorized to use Firebase Authentication',
    retryable: false,
  },
  
  // Age verification errors (custom)
  'auth/underage-user': {
    message: 'You must be 21 or older to use this app',
    retryable: false,
  },
  'auth/invalid-birthdate': {
    message: 'Please enter a valid birthdate',
    retryable: true,
  },
  'auth/birthdate-required': {
    message: 'Birthdate is required',
    retryable: true,
  },
  
  // Blocked user errors (custom)
  'auth/user-blocked': {
    message: 'This account has been blocked',
    retryable: false,
  },
  'auth/phone-number-blocked': {
    message: 'This phone number is not eligible for registration',
    retryable: false,
  },
  
  // Validation errors (custom)
  'validation-error': {
    message: 'Please check your input and try again',
    retryable: true,
  },
};

/**
 * Maps Firebase authentication errors to user-friendly AuthError objects
 * 
 * @param error - The error object from Firebase or custom validation
 * @returns AuthError object with code, message, userFriendly message, and retryable flag
 * 
 * @example
 * try {
 *   await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
 * } catch (error) {
 *   const authError = mapAuthError(error);
 *   console.log(authError.userFriendly); // User-friendly message
 *   console.log(authError.retryable); // Can user retry?
 * }
 */
export function mapAuthError(error: unknown): AuthError {
  // Handle Firebase errors
  const firebaseError = error as { code?: string; message?: string };
  const code = firebaseError?.code || 'unknown';
  const technicalMessage = firebaseError?.message || 'An unexpected error occurred';
  
  // Look up error in our comprehensive map
  const errorInfo = AUTH_ERROR_MESSAGES[code];
  
  if (errorInfo) {
    return {
      code,
      message: technicalMessage,
      userFriendly: errorInfo.message,
      retryable: errorInfo.retryable,
    };
  }
  
  // Default fallback for unknown errors
  return {
    code,
    message: technicalMessage,
    userFriendly: 'Something went wrong. Please try again',
    retryable: true,
  };
}

/**
 * Creates a custom auth error for age verification failures
 * 
 * @param age - The user's calculated age
 * @returns AuthError object for underage users
 */
export function createUnderageError(age: number): AuthError {
  return {
    code: 'auth/underage-user',
    message: `User is ${age} years old, minimum age is 21`,
    userFriendly: 'You must be 21 or older to use this app',
    retryable: false,
  };
}

/**
 * Creates a custom auth error for blocked users
 * 
 * @param reason - The reason the user is blocked
 * @returns AuthError object for blocked users
 */
export function createBlockedUserError(reason: string = 'underage'): AuthError {
  return {
    code: 'auth/phone-number-blocked',
    message: `Phone number blocked: ${reason}`,
    userFriendly: 'This phone number is not eligible for registration',
    retryable: false,
  };
}

/**
 * Creates a custom validation error
 * 
 * @param message - The validation error message
 * @returns AuthError object for validation errors
 */
export function createValidationError(message: string): AuthError {
  return {
    code: 'validation-error',
    message,
    userFriendly: message,
    retryable: true,
  };
}

/**
 * Creates a custom rate limit error
 * 
 * @param resetAt - The time when the rate limit will reset
 * @returns AuthError object for rate limit errors
 */
export function createRateLimitError(resetAt: Date): AuthError {
  const now = Date.now();
  const diff = resetAt.getTime() - now;
  const minutes = Math.ceil(diff / (60 * 1000));
  
  const timeString = minutes === 1 ? '1 minute' : `${minutes} minutes`;
  
  return {
    code: 'auth/rate-limit-exceeded',
    message: `Rate limit exceeded. Reset at ${resetAt.toISOString()}`,
    userFriendly: `Too many attempts. Please try again in ${timeString}`,
    retryable: false,
  };
}

/**
 * Retry Logic for Network Errors
 */

/**
 * Sends verification code with automatic retry for network errors
 * Uses exponential backoff (1s, 2s delays) with maximum 2 retries
 * 
 * @param sendFunction - The function that sends the verification code
 * @param maxRetries - Maximum number of retry attempts (default: 2)
 * @returns Promise that resolves with the confirmation result
 * 
 * @example
 * const confirmation = await sendVerificationCodeWithRetry(
 *   () => signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
 * );
 */
export async function sendVerificationCodeWithRetry<T>(
  sendFunction: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Attempt to send verification code
      return await sendFunction();
    } catch (error) {
      lastError = error as Error;
      const firebaseError = error as { code?: string };
      
      // Only retry for network-related errors
      const isNetworkError = 
        firebaseError.code === 'auth/network-request-failed' ||
        firebaseError.code === 'auth/timeout';
      
      // If not a network error or we've exhausted retries, throw immediately
      if (!isNetworkError || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: 1s for first retry, 2s for second retry
      const delayMs = 1000 * (attempt + 1);
      
      console.log(
        `Network error on attempt ${attempt + 1}/${maxRetries + 1}. ` +
        `Retrying in ${delayMs}ms...`
      );
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Unknown error during retry');
}

/**
 * Checks if an error is retryable based on its error code
 * 
 * @param error - The error to check
 * @returns true if the error is retryable, false otherwise
 */
export function isRetryableError(error: unknown): boolean {
  const authError = mapAuthError(error);
  return authError.retryable;
}

/**
 * Delays execution for a specified number of milliseconds
 * Useful for implementing custom retry logic
 * 
 * @param ms - Number of milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
