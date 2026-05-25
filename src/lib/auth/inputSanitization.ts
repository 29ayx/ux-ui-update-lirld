/**
 * Sanitize phone number input
 * Removes all characters except digits and the + symbol
 */
export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d+]/g, '');
}

/**
 * Sanitize verification code input
 * Removes all non-digit characters and limits to 6 digits
 */
export function sanitizeCodeInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6);
}

/**
 * Sanitize search query for country selector
 * Removes potentially dangerous characters while allowing letters, numbers, spaces, and +
 */
export function sanitizeSearchQuery(value: string): string {
  return value.replace(/[^\w\s+]/g, '').slice(0, 100);
}

/**
 * Mask phone number for display
 * Shows first 3 and last 2 digits, masks the rest
 * Example: +1 (555) 123-4567 → +1 (555) ***-**67
 */
export function maskPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  if (cleaned.length < 5) return phoneNumber;
  
  // Extract parts
  const countryCode = cleaned.match(/^\+\d+/)?.[0] || '';
  const remaining = cleaned.slice(countryCode.length);
  
  if (remaining.length < 5) return phoneNumber;
  
  // Show first 3 and last 2 digits
  const first = remaining.slice(0, 3);
  const last = remaining.slice(-2);
  const masked = '*'.repeat(remaining.length - 5);
  
  return `${countryCode} (${first}) ${masked}${last}`;
}

/**
 * Format verification code with spacing
 * Example: 123456 → 123 456
 */
export function formatVerificationCode(code: string): string {
  const cleaned = code.replace(/\D/g, '').slice(0, 6);
  if (cleaned.length <= 3) return cleaned;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
}
