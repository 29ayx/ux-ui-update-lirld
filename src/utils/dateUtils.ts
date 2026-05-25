/**
 * Date Utilities
 * 
 * Reusable date manipulation and formatting functions.
 * Used across the application for consistent date handling.
 * 
 * @module dateUtils
 */

/**
 * Validates if a string is a valid date
 * 
 * @param dateString - Date string to validate
 * @returns true if valid date, false otherwise
 * 
 * @example
 * isValidDate("2024-01-15") // true
 * isValidDate("invalid") // false
 * isValidDate("") // false
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Formats a date string to a readable format
 * 
 * @param dateString - ISO date string
 * @param format - Format type ('short', 'long', 'relative')
 * @returns Formatted date string, or empty string if invalid
 * 
 * @example
 * formatDate("2024-01-15", "long") // "January 15, 2024"
 * formatDate("2024-01-15", "short") // "Jan 15"
 * formatDate("2024-01-15T10:30:00Z", "relative") // "2 hours ago"
 */
export function formatDate(
  dateString: string, 
  format: 'short' | 'long' | 'relative'
): string {
  if (!isValidDate(dateString)) {
    return '';
  }
  
  const date = new Date(dateString);
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    
    case 'long':
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    
    case 'relative':
      return getRelativeTime(date);
    
    default:
      return dateString;
  }
}

/**
 * Gets relative time string (e.g., "2 hours ago", "just now")
 * 
 * @param date - Date object to compare against current time
 * @returns Relative time string
 * 
 * @example
 * getRelativeTime(new Date(Date.now() - 1000 * 60 * 5)) // "5 minutes ago"
 * getRelativeTime(new Date(Date.now() - 1000 * 30)) // "just now"
 * getRelativeTime(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)) // "2 days ago"
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Handle future dates
  if (diffMs < 0) {
    return 'in the future';
  }
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  // Less than a minute
  if (diffSec < 60) {
    return 'just now';
  }
  
  // Less than an hour
  if (diffMin < 60) {
    return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
  }
  
  // Less than a day
  if (diffHour < 24) {
    return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
  }
  
  // Less than a week
  if (diffDay < 7) {
    return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
  }
  
  // Less than a month
  if (diffWeek < 4) {
    return diffWeek === 1 ? '1 week ago' : `${diffWeek} weeks ago`;
  }
  
  // Less than a year
  if (diffMonth < 12) {
    return diffMonth === 1 ? '1 month ago' : `${diffMonth} months ago`;
  }
  
  // Years
  return diffYear === 1 ? '1 year ago' : `${diffYear} years ago`;
}
