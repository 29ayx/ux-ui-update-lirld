/**
 * URL Validation Utilities
 * 
 * Reusable functions for validating URLs across the application.
 * Prevents injection attacks and ensures only valid URLs are used.
 * 
 * @module urlValidation
 */

/**
 * Validates if a string is a valid HTTP/HTTPS URL
 * 
 * Security: Only allows http: and https: protocols to prevent
 * injection attacks via javascript:, data:, file:, etc.
 * 
 * @param urlString - String to validate
 * @returns true if valid HTTP/HTTPS URL, false otherwise
 * 
 * @example
 * isValidHttpUrl("https://example.com") // true
 * isValidHttpUrl("http://example.com/path") // true
 * isValidHttpUrl("javascript:alert(1)") // false
 * isValidHttpUrl("data:text/html,<script>alert(1)</script>") // false
 * isValidHttpUrl("not a url") // false
 * isValidHttpUrl("") // false
 */
export function isValidHttpUrl(urlString: string): boolean {
  // Return false for empty or non-string inputs
  if (!urlString || typeof urlString !== 'string') {
    return false;
  }

  try {
    const url = new URL(urlString);
    // Only allow http and https protocols for security
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    // URL constructor throws for invalid URLs
    return false;
  }
}

/**
 * Validates if URL is from an allowed domain
 * 
 * Useful for restricting image sources or external links to trusted domains.
 * Checks if the URL's hostname ends with any of the allowed domains.
 * 
 * @param urlString - URL to validate
 * @param allowedDomains - Array of allowed domain names (e.g., ['example.com', 'cdn.example.com'])
 * @returns true if URL is from an allowed domain, false otherwise
 * 
 * @example
 * isAllowedDomain("https://cdn.example.com/image.jpg", ["example.com"]) // true
 * isAllowedDomain("https://subdomain.example.com/path", ["example.com"]) // true
 * isAllowedDomain("https://evil.com/image.jpg", ["example.com"]) // false
 * isAllowedDomain("not a url", ["example.com"]) // false
 * isAllowedDomain("https://example.com", []) // false (no allowed domains)
 */
export function isAllowedDomain(urlString: string, allowedDomains: string[]): boolean {
  // Return false for empty inputs or empty allowed domains
  if (!urlString || !allowedDomains || allowedDomains.length === 0) {
    return false;
  }

  try {
    const url = new URL(urlString);
    // Check if hostname ends with any of the allowed domains
    return allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );
  } catch {
    // URL constructor throws for invalid URLs
    return false;
  }
}
