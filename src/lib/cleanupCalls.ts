import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Cleanup old ringing calls that are stuck
 * This should be run on app initialization
 */
export async function cleanupOldRingingCalls() {
  try {
    console.log('[CleanupCalls] Starting cleanup of old ringing calls...');
    
    const callsRef = collection(db, 'calls');
    const q = query(callsRef, where('status', '==', 'ringing'));
    
    const snapshot = await getDocs(q);
    console.log('[CleanupCalls] Found', snapshot.docs.length, 'ringing calls');
    
    const now = Date.now() / 1000;
    let cleanedCount = 0;
    
    for (const callDoc of snapshot.docs) {
      const call = callDoc.data();
      const createdAt = call.createdAt;
      
      if (createdAt && createdAt.seconds) {
        const age = now - createdAt.seconds;
        
        // If call is older than 30 seconds, mark as failed
        if (age > 30) {
          console.log('[CleanupCalls] Cleaning up old call:', callDoc.id, 'age:', Math.floor(age), 'seconds');
          await updateDoc(doc(db, 'calls', callDoc.id), {
            status: 'failed',
            endTime: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          cleanedCount++;
        }
      }
    }
    
    console.log('[CleanupCalls] Cleanup complete. Cleaned', cleanedCount, 'calls');
  } catch (error) {
    console.error('[CleanupCalls] Error cleaning up calls:', error);
  }
}
