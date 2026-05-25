import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// TypeScript interfaces for host-related types
export interface HostApplication {
  userId: string;
  verificationId: string;
  pricePerMinute: number;
  status: "pending" | "approved" | "rejected";
  appliedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface HostApplicationData {
  verificationId: string;
  pricePerMinute: number;
}

/**
 * Submit a host application
 * Creates a new host application document in Firestore with pending status
 * @param userId - The user's ID
 * @param verificationId - Verification ID provided by the user
 * @param pricePerMinute - Price per minute set by the user
 */
export async function submitHostApplication(
  userId: string,
  verificationId: string,
  pricePerMinute: number
): Promise<void> {
  try {
    const hostApplicationRef = doc(db, "hostApplications", userId);
    
    const applicationData: Omit<HostApplication, "appliedAt"> & {
      appliedAt: ReturnType<typeof serverTimestamp>;
    } = {
      userId,
      verificationId,
      pricePerMinute,
      status: "pending",
      appliedAt: serverTimestamp(),
    };

    await setDoc(hostApplicationRef, applicationData);
  } catch (error) {
    console.error("Error submitting host application:", error);
    throw error;
  }
}

/**
 * Get the host application status for a user
 * @param userId - The user's ID
 * @returns The host application data or null if not found
 */
export async function getHostApplicationStatus(
  userId: string
): Promise<HostApplication | null> {
  try {
    const hostApplicationRef = doc(db, "hostApplications", userId);
    const hostApplicationSnap = await getDoc(hostApplicationRef);

    if (hostApplicationSnap.exists()) {
      return hostApplicationSnap.data() as HostApplication;
    }

    return null;
  } catch (error) {
    console.error("Error getting host application status:", error);
    throw error;
  }
}

/**
 * Dismiss the promo card for a user
 * Stores the dismissal preference in the user's document
 * @param userId - The user's ID
 */
export async function dismissPromoCard(userId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    
    await updateDoc(userRef, {
      promoCardDismissed: true,
      promoCardDismissedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error dismissing promo card:", error);
    throw error;
  }
}

/**
 * Check if the promo card should be shown to a user
 * Logic:
 * - Show to EVERYONE, all the time
 * - No checks, no restrictions
 * @param userId - The user's ID
 * @returns Always true - show to everyone
 */
export async function shouldShowPromoCard(userId: string): Promise<boolean> {
  // Always show the promo card to everyone
  return true;
}

/**
 * Approve a host application (admin only)
 * Updates both the hostApplications and users collections
 * @param userId - The user's ID
 * @param adminId - The admin's ID who is approving
 */
export async function approveHostApplication(
  userId: string,
  adminId: string
): Promise<void> {
  try {
    // Check if the admin has permission
    const adminRef = doc(db, "users", adminId);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists() || adminSnap.data().isAdmin !== true) {
      throw new Error("Unauthorized: Only admins can approve host applications");
    }

    const hostApplicationRef = doc(db, "hostApplications", userId);
    const hostApplicationSnap = await getDoc(hostApplicationRef);

    if (!hostApplicationSnap.exists()) {
      throw new Error("Host application not found");
    }

    const applicationData = hostApplicationSnap.data() as HostApplication;

    // Update host application status
    await updateDoc(hostApplicationRef, {
      status: "approved",
      reviewedAt: serverTimestamp(),
      reviewedBy: adminId,
    });

    // Update user document to mark as host
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      isHost: true,
      pricePerMinute: applicationData.pricePerMinute,
      hostApprovedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error approving host application:", error);
    throw error;
  }
}

/**
 * Reject a host application (admin only)
 * Updates the hostApplications collection with rejection details
 * @param userId - The user's ID
 * @param adminId - The admin's ID who is rejecting
 * @param reason - Reason for rejection
 */
export async function rejectHostApplication(
  userId: string,
  adminId: string,
  reason: string
): Promise<void> {
  try {
    // Check if the admin has permission
    const adminRef = doc(db, "users", adminId);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists() || adminSnap.data().isAdmin !== true) {
      throw new Error("Unauthorized: Only admins can reject host applications");
    }

    const hostApplicationRef = doc(db, "hostApplications", userId);
    const hostApplicationSnap = await getDoc(hostApplicationRef);

    if (!hostApplicationSnap.exists()) {
      throw new Error("Host application not found");
    }

    // Update host application status
    await updateDoc(hostApplicationRef, {
      status: "rejected",
      reviewedAt: serverTimestamp(),
      reviewedBy: adminId,
      rejectionReason: reason,
    });
  } catch (error) {
    console.error("Error rejecting host application:", error);
    throw error;
  }
}

/**
 * Withdraw a host application
 * Allows users to withdraw their pending application
 * @param userId - The user's ID
 */
export async function withdrawHostApplication(userId: string): Promise<void> {
  try {
    const hostApplicationRef = doc(db, "hostApplications", userId);
    const hostApplicationSnap = await getDoc(hostApplicationRef);

    if (!hostApplicationSnap.exists()) {
      throw new Error("No application found to withdraw");
    }

    const applicationData = hostApplicationSnap.data() as HostApplication;

    if (applicationData.status !== "pending") {
      throw new Error("Can only withdraw pending applications");
    }

    // Delete the application
    await deleteDoc(hostApplicationRef);
  } catch (error) {
    console.error("Error withdrawing host application:", error);
    throw error;
  }
}
