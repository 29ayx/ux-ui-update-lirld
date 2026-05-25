import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Permission status type
 */
export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown';

/**
 * Permission request result
 */
export interface PermissionRequestResult {
  granted: boolean;
  status: PermissionStatus;
  skipped?: boolean;
}

/**
 * Check and request microphone permission before making a call
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export async function checkMicrophonePermission(): Promise<boolean> {
  try {
    // Try to get microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Stop the stream immediately - we just needed to check permission
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    
    // Show user-friendly message
    alert(
      'Microphone access is required for calls.\n\n' +
      'Please click "Allow" when your browser asks for microphone permission.\n\n' +
      'If you previously denied access, click the lock icon in your browser address bar and enable the microphone.'
    );
    
    return false;
  }
}

/**
 * Request microphone permission with user explanation
 * This is used during onboarding to request permission proactively
 * @returns Promise<PermissionRequestResult> - result of permission request
 */
export async function requestMicrophonePermission(): Promise<PermissionRequestResult> {
  try {
    // Try to get microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Stop the stream immediately - we just needed to check permission
    stream.getTracks().forEach(track => track.stop());
    
    return {
      granted: true,
      status: 'granted'
    };
  } catch (error) {
    console.error('Microphone permission denied:', error);
    
    // Determine the status based on the error
    const permissionError = error as DOMException;
    let status: PermissionStatus = 'denied';
    
    if (permissionError.name === 'NotAllowedError') {
      status = 'denied';
    } else if (permissionError.name === 'NotFoundError') {
      status = 'unknown'; // No microphone found
    }
    
    return {
      granted: false,
      status
    };
  }
}

/**
 * Check current microphone permission status without requesting
 * @returns Promise<PermissionStatus> - current permission status
 */
export async function checkMicrophonePermissionStatus(): Promise<PermissionStatus> {
  try {
    // Check if Permissions API is available
    if (!navigator.permissions) {
      return 'unknown';
    }
    
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return result.state as PermissionStatus;
  } catch (error) {
    console.warn('Could not check microphone permission status:', error);
    return 'unknown';
  }
}

/**
 * Store microphone permission status in user preferences
 * @param userId - User ID
 * @param status - Permission status
 */
export async function storeMicrophonePermissionStatus(
  userId: string,
  status: PermissionStatus,
  skipped: boolean = false
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      permissions: {
        microphone: {
          status,
          skipped,
          requestedAt: new Date().toISOString(),
        }
      }
    });
  } catch (error) {
    console.error('Error storing microphone permission status:', error);
    throw error;
  }
}
