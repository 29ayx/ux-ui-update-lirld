import { httpsCallable } from 'firebase/functions';
import { functions } from '~/lib/firebase';

/**
 * Check age eligibility after Google sign-in
 * This calls a Firebase Cloud Function to verify the user's age server-side
 * @param birthdate - User's date of birth
 * @returns Promise that resolves if eligible, rejects if underage
 */
export async function verifyGoogleUserAge(birthdate: Date): Promise<void> {
  try {
    const checkAgeEligibility = httpsCallable(functions, 'checkAgeEligibility');
    const result = await checkAgeEligibility({ 
      birthdate: birthdate.toISOString() 
    });
    
    const data = result.data as { eligible: boolean };
    
    if (!data.eligible) {
      throw new Error('User is not eligible (under 21)');
    }
  } catch (error) {
    console.error('Age verification failed:', error);
    throw error;
  }
}

/**
 * Extract birthdate from Google OAuth profile
 * Note: This requires the birthday scope to be requested during OAuth
 * @param user - Firebase user object
 * @returns Birthdate if available, null otherwise
 */
export async function extractBirthdateFromGoogle(user: any): Promise<Date | null> {
  try {
    // Get the user's ID token
    const idToken = await user.getIdToken();
    
    // Note: Google's birthday data is not directly available in the ID token
    // It requires a separate API call to the Google People API
    // For now, we'll return null and rely on client-side age verification
    // during the onboarding flow
    
    // TODO: Implement Google People API call to fetch birthday
    // This would require:
    // 1. Getting the OAuth access token (not just ID token)
    // 2. Making a request to https://people.googleapis.com/v1/people/me?personFields=birthdays
    // 3. Parsing the response to extract the birthdate
    
    return null;
  } catch (error) {
    console.error('Failed to extract birthdate from Google:', error);
    return null;
  }
}
