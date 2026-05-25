/**
 * Location detection service using IP geolocation
 * Detects city and country for auto-populating user location
 * Location is stored in Firestore after authentication (hidden from user during auth flow)
 */

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '~/lib/firebase';

const LOCATION_DETECTION_CACHE_KEY = 'detected_location';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface DetectedLocation {
  city: string;
  country: string;
  countryCode?: string;
  region?: string;
}

interface LocationDetectionCache {
  location: DetectedLocation;
  timestamp: number;
}

interface IpApiLocationResponse {
  city: string;
  country_name: string;
  country_code: string;
  region?: string;
  error?: boolean;
  reason?: string;
}

/**
 * Detects user's location (city and country) based on IP address
 * Results are cached in sessionStorage to avoid repeated API calls
 * 
 * @returns DetectedLocation object with city and country, or null on failure
 */
export async function detectLocation(): Promise<DetectedLocation | null> {
  // Check cache first
  const cached = getCachedLocation();
  if (cached) {
    console.log('Using cached location:', cached);
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
      console.warn('Location detection API returned error:', response.status);
      return null;
    }

    const data: IpApiLocationResponse = await response.json();

    // Check for API error response
    if (data.error) {
      console.warn('Location detection API error:', data.reason);
      return null;
    }

    // Validate required fields
    if (!data.city || !data.country_name) {
      console.warn('Incomplete location data received');
      return null;
    }

    const location: DetectedLocation = {
      city: data.city,
      country: data.country_name,
      countryCode: data.country_code,
      region: data.region,
    };

    // Cache the result
    cacheLocation(location);
    console.log('Detected location:', location);

    return location;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('Location detection timed out after 3s');
      } else {
        console.warn('Location detection failed:', error.message);
      }
    }
    return null;
  }
}

/**
 * Stores detected location in user's Firestore document
 * Called after successful authentication
 * Location is hidden from user during auth flow
 * 
 * @param userId - The authenticated user's ID
 * @param location - The detected location to store
 */
export async function storeUserLocation(
  userId: string,
  location: DetectedLocation
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      location: {
        city: location.city,
        country: location.country,
        countryCode: location.countryCode,
        region: location.region,
        detectedAt: serverTimestamp(),
        source: 'ip_geolocation',
      },
      locationUpdatedAt: serverTimestamp(),
    });

    console.log('User location stored successfully:', userId);
  } catch (error) {
    console.error('Failed to store user location:', error);
    // Don't throw - location storage failure shouldn't block auth flow
  }
}

/**
 * Gets cached location from sessionStorage
 * Returns null if cache is expired or doesn't exist
 */
function getCachedLocation(): DetectedLocation | null {
  try {
    const cached = sessionStorage.getItem(LOCATION_DETECTION_CACHE_KEY);
    if (!cached) return null;

    const data: LocationDetectionCache = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - data.timestamp < CACHE_DURATION_MS) {
      return data.location;
    }

    // Cache expired, remove it
    sessionStorage.removeItem(LOCATION_DETECTION_CACHE_KEY);
    return null;
  } catch (error) {
    console.warn('Failed to read location cache:', error);
    return null;
  }
}

/**
 * Caches location in sessionStorage
 */
function cacheLocation(location: DetectedLocation): void {
  try {
    const data: LocationDetectionCache = {
      location,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(LOCATION_DETECTION_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache location:', error);
  }
}

/**
 * Clears the location detection cache
 * Useful for testing or manual refresh
 */
export function clearLocationCache(): void {
  try {
    sessionStorage.removeItem(LOCATION_DETECTION_CACHE_KEY);
    console.log('Location cache cleared');
  } catch (error) {
    console.warn('Failed to clear location cache:', error);
  }
}
