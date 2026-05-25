/**
 * Rate limiting for phone authentication
 * Prevents abuse by limiting verification code requests to 3 attempts per 15 minutes per phone number
 */

interface RateLimitData {
  count: number;
  resetAt: number;
}

// In-memory attempt tracker
// Note: This resets on page reload, which is acceptable for client-side rate limiting
// For production, consider server-side rate limiting as well
const attemptTracker = new Map<string, RateLimitData>();

const MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if a phone number has exceeded the rate limit
 * @param phoneNumber - The phone number to check (should be in E.164 format)
 * @returns Object with allowed status and optional reset time
 */
export function checkRateLimit(phoneNumber: string): {
  allowed: boolean;
  attemptsRemaining?: number;
  resetAt?: Date;
} {
  const now = Date.now();
  const key = phoneNumber;
  const attempt = attemptTracker.get(key);

  // No previous attempts or window has expired
  if (!attempt || now > attempt.resetAt) {
    // Create new tracking entry
    attemptTracker.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return {
      allowed: true,
      attemptsRemaining: MAX_ATTEMPTS - 1,
    };
  }

  // Check if limit exceeded
  if (attempt.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      resetAt: new Date(attempt.resetAt),
    };
  }

  // Increment attempt count
  attempt.count++;

  return {
    allowed: true,
    attemptsRemaining: MAX_ATTEMPTS - attempt.count,
  };
}

/**
 * Reset rate limit for a phone number (useful for testing or manual override)
 * @param phoneNumber - The phone number to reset
 */
export function resetRateLimit(phoneNumber: string): void {
  attemptTracker.delete(phoneNumber);
}

/**
 * Get current rate limit status for a phone number
 * @param phoneNumber - The phone number to check
 * @returns Current status or null if no attempts recorded
 */
export function getRateLimitStatus(phoneNumber: string): {
  attempts: number;
  resetAt: Date;
} | null {
  const attempt = attemptTracker.get(phoneNumber);
  
  if (!attempt) {
    return null;
  }

  return {
    attempts: attempt.count,
    resetAt: new Date(attempt.resetAt),
  };
}

/**
 * Format the time remaining until rate limit reset
 * @param resetAt - The reset timestamp
 * @returns Human-readable time string
 */
export function formatTimeRemaining(resetAt: Date): string {
  const now = Date.now();
  const diff = resetAt.getTime() - now;

  if (diff <= 0) {
    return '0 minutes';
  }

  const minutes = Math.ceil(diff / (60 * 1000));

  if (minutes === 1) {
    return '1 minute';
  }

  return `${minutes} minutes`;
}
