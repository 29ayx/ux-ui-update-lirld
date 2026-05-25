import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  serverTimestamp,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Data structure for user balance
 */
export interface UserBalance {
  userId: string;
  credits: number;
  lastUpdated: Timestamp;
}

/**
 * Data structure for credit transactions
 */
export interface Transaction {
  id?: string;
  userId: string;
  type: 'debit' | 'credit';
  amount: number;
  reason: string;
  callId?: string;
  timestamp: Timestamp;
  balanceBefore: number;
  balanceAfter: number;
}

/**
 * Get user's current credit balance
 * @param userId - The user's ID
 * @returns The user's current credit balance
 */
export async function getUserBalance(userId: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    return userData.credits ?? 0;
  } catch (error) {
    console.error('Error getting user balance:', error);
    throw error;
  }
}

/**
 * Check if user has sufficient credits for a call
 * @param userId - The user's ID
 * @param pricePerMinute - The price per minute for the call
 * @param minimumMinutes - Minimum minutes to check for (default: 1)
 * @returns True if user has sufficient credits, false otherwise
 */
export async function hasSufficientCredits(
  userId: string,
  pricePerMinute: number,
  minimumMinutes: number = 1
): Promise<boolean> {
  try {
    const balance = await getUserBalance(userId);
    const requiredCredits = pricePerMinute * minimumMinutes;
    return balance >= requiredCredits;
  } catch (error) {
    console.error('Error checking sufficient credits:', error);
    return false;
  }
}

/**
 * Deduct credits from user's balance with transaction logging
 * @param userId - The user's ID
 * @param amount - Amount of credits to deduct
 * @param callId - The call ID associated with this deduction
 * @returns True if deduction was successful, false otherwise
 */
export async function deductCredits(
  userId: string,
  amount: number,
  callId: string
): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const transactionsRef = collection(db, 'transactions');

    // Use Firestore transaction to ensure atomicity
    const success = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentBalance = userData.credits ?? 0;

      // Check if user has sufficient balance
      if (currentBalance < amount) {
        return false;
      }

      const newBalance = currentBalance - amount;

      // Update user's balance
      transaction.update(userRef, {
        credits: newBalance,
      });

      // Create transaction log
      const transactionData: Omit<Transaction, 'id'> = {
        userId,
        type: 'debit',
        amount,
        reason: 'Call charge',
        callId,
        timestamp: serverTimestamp() as Timestamp,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
      };

      const transactionDocRef = doc(transactionsRef);
      transaction.set(transactionDocRef, transactionData);

      return true;
    });

    return success;
  } catch (error) {
    console.error('Error deducting credits:', error);
    return false;
  }
}

/**
 * Start billing for a call with interval-based real-time credit deduction
 * Deducts credits every 6 seconds (0.1 minute)
 * @param callId - The call ID
 * @param callerId - The caller's user ID
 * @param pricePerMinute - Price per minute for the call
 * @returns Function to stop billing
 */
export function startBilling(
  callId: string,
  callerId: string,
  pricePerMinute: number
): () => void {
  // Calculate charge per interval (6 seconds = 0.1 minute)
  const intervalSeconds = 6;
  const intervalMinutes = intervalSeconds / 60;
  const chargePerInterval = pricePerMinute * intervalMinutes;

  // Set up interval for billing
  const billingInterval = setInterval(async () => {
    try {
      const success = await deductCredits(callerId, chargePerInterval, callId);

      if (!success) {
        // If deduction fails (insufficient balance), stop billing
        console.warn('Billing failed - insufficient balance');
        clearInterval(billingInterval);
        
        // Dispatch custom event to notify the app that balance is depleted
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('billing:insufficient-balance', {
              detail: { callId, callerId },
            })
          );
        }
      }
    } catch (error) {
      console.error('Error during billing interval:', error);
    }
  }, intervalSeconds * 1000);

  // Return function to stop billing
  return () => {
    clearInterval(billingInterval);
  };
}

/**
 * Add credits to user's balance (for future payment integration)
 * @param userId - The user's ID
 * @param amount - Amount of credits to add
 * @param source - Source of the credits (e.g., 'purchase', 'promotion', 'refund')
 * @returns Promise that resolves when credits are added
 */
export async function addCredits(
  userId: string,
  amount: number,
  source: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const transactionsRef = collection(db, 'transactions');

    // Use Firestore transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentBalance = userData.credits ?? 0;
      const newBalance = currentBalance + amount;

      // Update user's balance
      transaction.update(userRef, {
        credits: newBalance,
      });

      // Create transaction log
      const transactionData: Omit<Transaction, 'id'> = {
        userId,
        type: 'credit',
        amount,
        reason: source,
        timestamp: serverTimestamp() as Timestamp,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
      };

      const transactionDocRef = doc(transactionsRef);
      transaction.set(transactionDocRef, transactionData);
    });

    console.log(`Successfully added ${amount} credits to user ${userId}`);
  } catch (error) {
    console.error('Error adding credits:', error);
    throw error;
  }
}
