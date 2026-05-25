import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

/**
 * Result of phone number validation
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  formatted?: string;  // National format (e.g., "(555) 123-4567")
  e164?: string;       // E.164 format for Firebase (e.g., "+15551234567")
}

/**
 * Cache for validation results to avoid repeated parsing
 * Key format: "countryCode:phoneNumber"
 */
const validationCache = new Map<string, ValidationResult>();
const MAX_CACHE_SIZE = 50; // Limit cache size to prevent memory issues

/**
 * Validates a phone number for a specific country
 * Results are cached to avoid repeated parsing of the same number
 * 
 * @param phone - The phone number to validate (can include or exclude country code)
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB')
 * @returns ValidationResult with validation status and formatted numbers
 * 
 * @example
 * validatePhoneNumber('5551234567', 'US')
 * // Returns: { valid: true, formatted: '(555) 123-4567', e164: '+15551234567' }
 * 
 * @example
 * validatePhoneNumber('123', 'US')
 * // Returns: { valid: false, error: 'Please enter a valid US phone number' }
 */
export function validatePhoneNumber(
  phone: string,
  countryCode: string
): ValidationResult {
  // Handle empty input
  if (!phone || phone.trim() === '') {
    return {
      valid: false,
      error: 'Phone number is required'
    };
  }

  // Check cache first
  const cacheKey = `${countryCode}:${phone}`;
  const cached = validationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let result: ValidationResult;

  try {
    // Parse the phone number with the country code
    const phoneNumber = parsePhoneNumber(phone, countryCode as CountryCode);
    
    // Check if parsing was successful and number is valid
    if (!phoneNumber || !phoneNumber.isValid()) {
      result = {
        valid: false,
        error: `Please enter a valid ${countryCode} phone number`
      };
    } else {
      // Return successful validation with formatted numbers
      result = {
        valid: true,
        formatted: phoneNumber.formatNational(),
        e164: phoneNumber.format('E.164')
      };
    }
  } catch (error) {
    // Handle parsing errors gracefully
    console.warn('Phone validation error:', error);
    result = {
      valid: false,
      error: 'Invalid phone number format'
    };
  }

  // Cache the result (with size limit)
  if (validationCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry (first key)
    const firstKey = validationCache.keys().next().value;
    if (firstKey) {
      validationCache.delete(firstKey);
    }
  }
  validationCache.set(cacheKey, result);

  return result;
}

/**
 * Quick validation check without detailed formatting
 * Useful for real-time validation during input
 * 
 * @param phone - The phone number to check
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns true if the phone number is valid
 */
export function isPhoneNumberValid(phone: string, countryCode: string): boolean {
  try {
    return isValidPhoneNumber(phone, countryCode as CountryCode);
  } catch {
    return false;
  }
}

/**
 * Clears the validation cache
 * Useful for testing or when memory needs to be freed
 */
export function clearValidationCache(): void {
  validationCache.clear();
}
