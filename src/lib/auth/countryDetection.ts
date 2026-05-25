/**
 * Country detection service using IP geolocation
 * Uses ipapi.co free API (1000 requests/day, no key required)
 */

const COUNTRY_DETECTION_CACHE_KEY = 'detected_country';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CountryDetectionCache {
  countryCode: string;
  timestamp: number;
}

interface IpApiResponse {
  country_code: string;
  country_name: string;
  city?: string;
  error?: boolean;
  reason?: string;
}

/**
 * Detects user's country based on IP address
 * Results are cached in sessionStorage to avoid repeated API calls
 * 
 * @returns ISO 3166-1 alpha-2 country code (e.g., 'US') or null on failure
 */
export async function detectCountry(): Promise<string | null> {
  // Check cache first
  const cached = getCachedCountry();
  if (cached) {
    console.log('Using cached country:', cached);
    return cached;
  }

  try {
    // Fetch with 3s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('Country detection API returned error:', response.status);
      return fallbackCountry();
    }

    const data: IpApiResponse = await response.json();

    // Check for API error response
    if (data.error) {
      console.warn('Country detection API error:', data.reason);
      return fallbackCountry();
    }

    const countryCode = data.country_code;

    if (!countryCode || countryCode.length !== 2) {
      console.warn('Invalid country code received:', countryCode);
      return fallbackCountry();
    }

    // Cache the result
    cacheCountry(countryCode);
    console.log('Detected country:', countryCode);

    return countryCode;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('Country detection timed out after 3s');
      } else {
        console.warn('Country detection failed:', error.message);
      }
    }
    return fallbackCountry();
  }
}

/**
 * Gets cached country code from sessionStorage
 * Returns null if cache is expired or doesn't exist
 */
function getCachedCountry(): string | null {
  try {
    const cached = sessionStorage.getItem(COUNTRY_DETECTION_CACHE_KEY);
    if (!cached) return null;

    const data: CountryDetectionCache = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - data.timestamp < CACHE_DURATION_MS) {
      return data.countryCode;
    }

    // Cache expired, remove it
    sessionStorage.removeItem(COUNTRY_DETECTION_CACHE_KEY);
    return null;
  } catch (error) {
    console.warn('Failed to read country cache:', error);
    return null;
  }
}

/**
 * Caches country code in sessionStorage
 */
function cacheCountry(countryCode: string): void {
  try {
    const data: CountryDetectionCache = {
      countryCode,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(COUNTRY_DETECTION_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache country:', error);
  }
}

/**
 * Returns fallback country code (US)
 */
function fallbackCountry(): string {
  console.log('Using fallback country: US');
  return 'US';
}

/**
 * Clears the country detection cache
 * Useful for testing or manual refresh
 */
export function clearCountryCache(): void {
  try {
    sessionStorage.removeItem(COUNTRY_DETECTION_CACHE_KEY);
    console.log('Country cache cleared');
  } catch (error) {
    console.warn('Failed to clear country cache:', error);
  }
}
