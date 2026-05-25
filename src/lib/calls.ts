import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { createCallLog } from './callLogs';
import { generateRoomName } from './livekit';
import { hasSufficientCredits } from './billing';

// Types
export interface Call {
  id: string;
  callerId: string;
  calleeId: string;
  status: 'initiating' | 'ringing' | 'active' | 'ended' | 'declined' | 'failed';
  startTime?: Timestamp;
  endTime?: Timestamp;
  duration?: number; // in seconds
  cost?: number; // total cost in credits
  isFree: boolean;
  context: 'profile' | 'chat' | 'general';
  pricePerMinute?: number;
  roomName?: string; // LiveKit room name
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CallContext = 'profile' | 'chat' | 'general';

/**
 * Initiate a call to another user
 * @param callerId - ID of the user initiating the call
 * @param calleeId - ID of the user being called
 * @param context - Context where the call is initiated from
 * @returns Promise resolving to the call ID
 */
export async function initiateCall(
  callerId: string,
  calleeId: string,
  context: CallContext = 'general'
): Promise<string> {
  // Validation
  if (!callerId || !calleeId) {
    throw new Error('Caller ID and Callee ID are required');
  }

  if (callerId === calleeId) {
    throw new Error('Cannot call yourself');
  }

  // Check if callee exists
  const calleeDoc = await getDoc(doc(db, 'users', calleeId));
  if (!calleeDoc.exists()) {
    throw new Error('Callee does not exist');
  }

  const calleeData = calleeDoc.data();
  
  // Get callee's price per minute (default to 0 if not set)
  const calleePricePerMinute = typeof calleeData.pricePerMinute === 'number' 
    ? calleeData.pricePerMinute 
    : 0;

  // Determine if call is paid based on callee's price
  // If callee has pricePerMinute > 0, it's a paid call
  const isFree = calleePricePerMinute === 0;
  const pricePerMinute = calleePricePerMinute;

  // Check privacy settings
  const canCall = await canReceiveCall(callerId, calleeId);
  if (!canCall.allowed) {
    throw new Error(canCall.reason || 'Call not allowed');
  }

  // If it's a paid call, check if caller has sufficient balance BEFORE creating the call
  if (!isFree && pricePerMinute > 0) {
    const hasCredits = await hasSufficientCredits(
      callerId,
      pricePerMinute,
      1 // Check for at least 1 minute
    );

    if (!hasCredits) {
      throw new Error(`Insufficient credits. This call costs ${pricePerMinute} credits per minute. Please add credits to make this call.`);
    }
  }

  // Create call document
  const callRef = doc(collection(db, 'calls'));
  const roomName = generateRoomName(callRef.id);

  const callData = {
    id: callRef.id,
    callerId,
    calleeId,
    status: 'ringing' as const,
    isFree,
    context,
    pricePerMinute,
    roomName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  console.log('Creating call:', {
    callId: callRef.id,
    callerId,
    calleeId,
    status: 'ringing',
    isFree,
    context,
    pricePerMinute,
    roomName,
  });

  await setDoc(callRef, callData);

  console.log('Call created successfully:', callRef.id);

  // Auto-timeout: Mark call as failed after 30 seconds if still ringing
  setTimeout(async () => {
    try {
      const callDoc = await getDoc(callRef);
      if (callDoc.exists()) {
        const currentCall = callDoc.data() as Call;
        if (currentCall.status === 'ringing') {
          console.log('Call timeout - marking as failed:', callRef.id);
          await updateDoc(callRef, {
            status: 'failed',
            endTime: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error('Error timing out call:', error);
    }
  }, 30000); // 30 seconds

  return callRef.id;
}

/**
 * Accept an incoming call
 * @param callId - ID of the call to accept
 * @param userId - ID of the user accepting the call
 */
export async function acceptCall(callId: string, userId: string): Promise<void> {
  if (!callId || !userId) {
    throw new Error('Call ID and User ID are required');
  }

  const callRef = doc(db, 'calls', callId);
  const callDoc = await getDoc(callRef);

  if (!callDoc.exists()) {
    throw new Error('Call does not exist');
  }

  const call = callDoc.data() as Call;

  // Verify user is the callee
  if (call.calleeId !== userId) {
    throw new Error('Only the callee can accept the call');
  }

  // Verify call is in ringing state
  if (call.status !== 'ringing') {
    throw new Error(`Cannot accept call in ${call.status} state`);
  }

  // Update call to active
  await updateDoc(callRef, {
    status: 'active',
    startTime: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Decline an incoming call or cancel an outgoing call
 * @param callId - ID of the call to decline/cancel
 * @param userId - ID of the user declining/canceling the call
 */
export async function declineCall(callId: string, userId: string): Promise<void> {
  if (!callId || !userId) {
    throw new Error('Call ID and User ID are required');
  }

  const callRef = doc(db, 'calls', callId);
  const callDoc = await getDoc(callRef);

  if (!callDoc.exists()) {
    throw new Error('Call does not exist');
  }

  const call = callDoc.data() as Call;

  // Verify user is either the caller or callee
  if (call.calleeId !== userId && call.callerId !== userId) {
    throw new Error('Only call participants can decline/cancel the call');
  }

  // Verify call is in ringing state
  if (call.status !== 'ringing') {
    throw new Error(`Cannot decline call in ${call.status} state`);
  }

  // Determine status based on who is declining
  const newStatus = call.callerId === userId ? 'failed' : 'declined';

  // Update call to declined/failed
  await updateDoc(callRef, {
    status: newStatus,
    endTime: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Create call log entries for both participants
  // Get the updated call document with the new status
  const updatedCallDoc = await getDoc(callRef);
  if (updatedCallDoc.exists()) {
    const updatedCall = updatedCallDoc.data() as Call;
    try {
      await createCallLog(updatedCall);
    } catch (error) {
      // Log error but don't block call decline
      console.error('Failed to create call log:', error);
    }
  }
}

/**
 * End an active call
 * @param callId - ID of the call to end
 * @param userId - ID of the user ending the call
 */
export async function endCall(callId: string, userId: string): Promise<void> {
  if (!callId || !userId) {
    throw new Error('Call ID and User ID are required');
  }

  const callRef = doc(db, 'calls', callId);
  const callDoc = await getDoc(callRef);

  if (!callDoc.exists()) {
    throw new Error('Call does not exist');
  }

  const call = callDoc.data() as Call;

  // Verify user is a participant
  if (call.callerId !== userId && call.calleeId !== userId) {
    throw new Error('Only call participants can end the call');
  }

  // Verify call is in active state
  if (call.status !== 'active') {
    throw new Error(`Cannot end call in ${call.status} state`);
  }

  // Calculate duration
  const now = Timestamp.now();
  const startTime = call.startTime as Timestamp;
  const durationSeconds = now.seconds - startTime.seconds;

  // Calculate cost (if not free)
  let cost = 0;
  if (!call.isFree && call.pricePerMinute) {
    const durationMinutes = durationSeconds / 60;
    cost = durationMinutes * call.pricePerMinute;
  }

  // Update call to ended
  await updateDoc(callRef, {
    status: 'ended',
    endTime: serverTimestamp(),
    duration: durationSeconds,
    cost,
    updatedAt: serverTimestamp(),
  });

  // Create call log entries for both participants
  // Get the updated call document with the new status
  const updatedCallDoc = await getDoc(callRef);
  if (updatedCallDoc.exists()) {
    const updatedCall = updatedCallDoc.data() as Call;
    try {
      await createCallLog(updatedCall);
    } catch (error) {
      // Log error but don't block call end
      console.error('Failed to create call log:', error);
    }
  }
}

/**
 * Subscribe to real-time call state updates
 * @param callId - ID of the call to subscribe to
 * @param callback - Callback function to receive call updates
 * @returns Unsubscribe function
 */
export function subscribeToCall(
  callId: string,
  callback: (call: Call | null) => void
): Unsubscribe {
  if (!callId) {
    throw new Error('Call ID is required');
  }

  const callRef = doc(db, 'calls', callId);

  return onSnapshot(
    callRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as Call);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('[subscribeToCall] Error:', error);
      callback(null);
    }
  );
}

/**
 * Check if a user can receive calls from another user based on privacy settings
 * @param callerId - ID of the user initiating the call
 * @param calleeId - ID of the user being called
 * @returns Promise resolving to whether the call is allowed and reason if not
 */
export async function canReceiveCall(
  callerId: string,
  calleeId: string
): Promise<{ allowed: boolean; reason?: string }> {
  if (!callerId || !calleeId) {
    return { allowed: false, reason: 'Invalid caller or callee ID' };
  }

  // Get callee's user document
  const calleeDoc = await getDoc(doc(db, 'users', calleeId));

  if (!calleeDoc.exists()) {
    return { allowed: false, reason: 'User does not exist' };
  }

  const calleeData = calleeDoc.data();

  // Check if callee accepts calls from strangers
  // Default to true if setting is not present
  const acceptCallsFromStrangers = calleeData.acceptCallsFromStrangers ?? true;

  if (!acceptCallsFromStrangers) {
    // TODO: In the future, check if users are contacts/friends
    // For now, if setting is false, block all calls except from self
    if (callerId !== calleeId) {
      return {
        allowed: false,
        reason: 'This user does not accept calls from strangers',
      };
    }
  }

  return { allowed: true };
}
