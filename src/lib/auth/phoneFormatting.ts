import { AsYouType, CountryCode } from 'libphonenumber-js';

/**
 * Result of formatting operation with cursor position preservation
 */
export interface FormatResult {
  formatted: string;
  cursorPosition: number;
}

/**
 * Cache for AsYouType formatter instances
 * Reusing instances improves performance for repeated formatting operations
 */
const formatterCache = new Map<string, AsYouType>();
const MAX_FORMATTER_CACHE_SIZE = 10; // Limit cache size

/**
 * Gets or creates an AsYouType formatter for a country
 * Formatters are cached and reused for better performance
 */
function getFormatter(countryCode: string): AsYouType {
  let formatter = formatterCache.get(countryCode);
  
  if (!formatter) {
    formatter = new AsYouType(countryCode as CountryCode);
    
    // Manage cache size
    if (formatterCache.size >= MAX_FORMATTER_CACHE_SIZE) {
      const firstKey = formatterCache.keys().next().value;
      if (firstKey) {
        formatterCache.delete(firstKey);
      }
    }
    
    formatterCache.set(countryCode, formatter);
  } else {
    // Reset the formatter for reuse
    formatter.reset();
  }
  
  return formatter;
}

/**
 * Formats a phone number as the user types, applying country-specific formatting
 * Uses cached formatter instances for better performance
 * 
 * @param value - The current input value
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB')
 * @returns Formatted phone number string
 * 
 * @example
 * formatAsYouType('5551234567', 'US')
 * // Returns: '(555) 123-4567'
 * 
 * @example
 * formatAsYouType('2071234567', 'GB')
 * // Returns: '020 7123 4567'
 */
export function formatAsYouType(
  value: string,
  countryCode: string
): string {
  if (!value) {
    return '';
  }

  try {
    const formatter = getFormatter(countryCode);
    return formatter.input(value);
  } catch (error) {
    console.warn('Phone formatting error:', error);
    // Return original value if formatting fails
    return value;
  }
}

/**
 * Formats phone number while preserving cursor position
 * This is crucial for maintaining a good user experience during typing
 * Uses cached formatter instances for better performance
 * 
 * @param value - The current input value
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param cursorPosition - Current cursor position in the input
 * @returns FormatResult with formatted string and adjusted cursor position
 * 
 * @example
 * formatWithCursor('5551234', 'US', 7)
 * // Returns: { formatted: '(555) 123-4', cursorPosition: 10 }
 */
export function formatWithCursor(
  value: string,
  countryCode: string,
  cursorPosition: number
): FormatResult {
  if (!value) {
    return { formatted: '', cursorPosition: 0 };
  }

  try {
    // Get the unformatted value (digits only)
    const digitsOnly = value.replace(/\D/g, '');
    
    // Count digits before cursor in original value
    const digitsBeforeCursor = value.slice(0, cursorPosition).replace(/\D/g, '').length;
    
    // Format the number using cached formatter
    const formatter = getFormatter(countryCode);
    const formatted = formatter.input(digitsOnly);
    
    // Calculate new cursor position
    // Find the position in formatted string where we have the same number of digits
    let newCursorPosition = 0;
    let digitCount = 0;
    
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        digitCount++;
        if (digitCount === digitsBeforeCursor) {
          newCursorPosition = i + 1;
          break;
        }
      }
    }
    
    // If we didn't find the position, place cursor at the end
    if (newCursorPosition === 0 && digitsBeforeCursor > 0) {
      newCursorPosition = formatted.length;
    }
    
    return {
      formatted,
      cursorPosition: newCursorPosition
    };
  } catch (error) {
    console.warn('Phone formatting with cursor error:', error);
    return {
      formatted: value,
      cursorPosition
    };
  }
}

/**
 * Strips all non-digit characters from a phone number
 * Useful for getting clean input before validation
 * 
 * @param value - The phone number string (may contain formatting)
 * @returns String with only digits
 * 
 * @example
 * stripFormatting('(555) 123-4567')
 * // Returns: '5551234567'
 */
export function stripFormatting(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Checks if a character is a valid phone number character
 * Allows digits, spaces, parentheses, hyphens, and plus sign
 * 
 * @param char - Character to check
 * @returns true if character is valid for phone input
 */
export function isValidPhoneChar(char: string): boolean {
  return /[\d\s()\-+]/.test(char);
}

/**
 * Clears the formatter cache
 * Useful for testing or when memory needs to be freed
 */
export function clearFormatterCache(): void {
  formatterCache.clear();
}
