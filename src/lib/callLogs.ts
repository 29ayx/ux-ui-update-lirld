import {
  collection,
  doc,
  setDoc,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Call } from './calls';

/**
 * Data structure for call logs
 */
export interface CallLog {
  id: string;
  userId: string; // Owner of this log
  otherUserId: string; // The other participant
  direction: 'incoming' | 'outgoing';
  status: 'completed' | 'missed' | 'declined';
  duration: number; // in seconds
  cost: number; // in credits
  isFree: boolean;
  timestamp: Timestamp;
  callId: string;
}

/**
 * Create call log entries for both participants after a call ends
 * @param call - The completed call object
 */
export async function createCallLog(call: Call): Promise<void> {
  try {
    // Validate call data
    if (!call.id || !call.callerId || !call.calleeId) {
      throw new Error('Invalid call data');
    }

    // Determine call status based on call.status
    // ended → completed, declined → declined, other → missed
    let logStatus: 'completed' | 'missed' | 'declined';
    if (call.status === 'ended') {
      logStatus = 'completed';
    } else if (call.status === 'declined') {
      logStatus = 'declined';
    } else {
      // Any other status (ringing, initiating, failed) is considered missed
      logStatus = 'missed';
    }

    // Create log for caller (outgoing)
    const callerLogRef = doc(
      collection(db, 'callLogs', call.callerId, 'logs')
    );
    const callerLogData: Omit<CallLog, 'id'> = {
      userId: call.callerId,
      otherUserId: call.calleeId,
      direction: 'outgoing',
      status: logStatus,
      duration: call.duration || 0,
      cost: call.cost || 0,
      isFree: call.isFree,
      timestamp: call.endTime || (serverTimestamp() as Timestamp),
      callId: call.id,
    };
    await setDoc(callerLogRef, { ...callerLogData, id: callerLogRef.id });

    // Create log for callee (incoming)
    const calleeLogRef = doc(
      collection(db, 'callLogs', call.calleeId, 'logs')
    );
    const calleeLogData: Omit<CallLog, 'id'> = {
      userId: call.calleeId,
      otherUserId: call.callerId,
      direction: 'incoming',
      status: logStatus,
      duration: call.duration || 0,
      cost: 0, // Callee doesn't pay
      isFree: call.isFree,
      timestamp: call.endTime || (serverTimestamp() as Timestamp),
      callId: call.id,
    };
    await setDoc(calleeLogRef, { ...calleeLogData, id: calleeLogRef.id });

    console.log(`Call logs created for call ${call.id}`);
  } catch (error) {
    console.error('Error creating call log:', error);
    throw error;
  }
}

/**
 * Get user's call logs with pagination support
 * @param userId - The user's ID
 * @param limitCount - Maximum number of logs to retrieve (default: 50)
 * @returns Array of call logs sorted by most recent first
 */
export async function getCallLogs(
  userId: string,
  limitCount: number = 50
): Promise<CallLog[]> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const logsRef = collection(db, 'callLogs', userId, 'logs');
    const logsQuery = query(
      logsRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(logsQuery);
    const logs: CallLog[] = [];

    querySnapshot.forEach((doc) => {
      logs.push(doc.data() as CallLog);
    });

    return logs;
  } catch (error) {
    console.error('Error getting call logs:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time call logs updates
 * @param userId - The user's ID
 * @param callback - Callback function to receive log updates
 * @param limitCount - Maximum number of logs to retrieve (default: 50)
 * @returns Unsubscribe function
 */
export function subscribeToCallLogs(
  userId: string,
  callback: (logs: CallLog[]) => void,
  limitCount: number = 50
): Unsubscribe {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const logsRef = collection(db, 'callLogs', userId, 'logs');
    const logsQuery = query(
      logsRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(
      logsQuery,
      (snapshot) => {
        const logs: CallLog[] = [];
        snapshot.forEach((doc) => {
          logs.push(doc.data() as CallLog);
        });
        callback(logs);
      },
      (error) => {
        console.error('Error subscribing to call logs:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error setting up call logs subscription:', error);
    // Return a no-op unsubscribe function
    return () => { };
  }
}
