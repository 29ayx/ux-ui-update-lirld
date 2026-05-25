import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '~/lib/firebase';

/**
 * Calculate age from birthdate
 * @param birthdate - Date of birth
 * @returns Age in years
 */
export function calculateAge(birthdate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Check if user meets the 21+ age requirement
 * @param birthdate - Date of birth
 * @returns True if user is 21 or older
 */
export function isEligible(birthdate: Date): boolean {
  return calculateAge(birthdate) >= 18;
}

/**
 * Block underage user by storing their phone number in Firestore
 * This prevents them from retrying with the same number
 * @param phoneNumber - Phone number in E.164 format
 */
export async function blockUnderageUser(phoneNumber: string): Promise<void> {
  try {
    await setDoc(doc(db, 'blockedUsers', phoneNumber), {
      reason: 'underage',
      blockedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to block underage user:', error);
    throw error;
  }
}
