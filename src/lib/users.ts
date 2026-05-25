import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export interface FirebaseUser {
  id: string;
  name?: string;
  Name?: string; // Legacy field name
  photos?: string[];
  imageUrl?: string; // Legacy field name
  dob?: string;
  language?: string;
  country?: string;
  email?: string;
  uid?: string;
  profileCompleted?: boolean;
  [key: string]: any; // For any other fields
}

export interface UserProfileWithOnlineStatus {
  user_id: string;
  name: string;
  age?: number;
  gender?: "male" | "female" | "other";
  bio?: string;
  country?: string;
  photos?: string[]; // Cloudinary photos array
  photo1_url?: string;
  photo2_url?: string;
  photo3_url?: string;
  photo4_url?: string;
  profile_picture_url?: string;
  photoURL?: string; // Fallback for legacy users
  vip?: boolean;
  isOnline?: boolean;
  lastSeen?: any;
  isHost?: boolean;
  pricePerMinute?: number;
  isHidden?: boolean;
  hidePrice?: boolean;
  isFeatured?: boolean;
  featuredGif?: string;
  language?: string;
  lookingFor?: string[];
  dob?: string;
  customization?: any;
}

/**
 * Fetch users from Firestore, excluding users who have chatted with current user
 * @param currentUserId - Current user's ID to exclude from results
 * @param limit - Optional limit for pagination
 * @param startAfterUserId - Optional user ID to start after for pagination
 */
export async function fetchUsers(
  currentUserId?: string,
  limit?: number,
  startAfterUserId?: string
): Promise<UserProfileWithOnlineStatus[]> {
  try {
    const usersCollection = collection(db, "users");
    // Fetch all users (no profileCompleted filter)
    const usersQuery = query(usersCollection);
    const usersSnapshot = await getDocs(usersQuery);

    const users: UserProfileWithOnlineStatus[] = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data() as FirebaseUser;
      const userId = doc.id;

      // Skip current user
      if (currentUserId && userId === currentUserId) {
        return;
      }

      // Skip hidden users
      if (data.isHidden === true) {
        return;
      }

      // Skip users who have chatted with current user (using chattedWith array)
      // Firestore doesn't support "array-does-not-contain", so we filter in code
      // But this is minimal filtering since we're using the chattedWith field
      if (currentUserId && data.chattedWith && Array.isArray(data.chattedWith)) {
        if (data.chattedWith.includes(currentUserId)) {
          return; // User has chatted with current user, skip
        }
      }

      // Support both new format (name, photos array) and legacy format (Name, imageUrl)
      const userName = data.name || data.Name || "";
      const photos = data.photos || (data.imageUrl ? [data.imageUrl] : []);

      // Only include users with at least a name
      if (!userName) {
        return;
      }

      // Check if user is online (within last 5 minutes)
      let isOnline = false;
      // Use forcedOnline to ignore polluted isOnline data
      if (data.forcedOnline === true) {
        isOnline = true;
      } else if (data.lastSeen) {
        let lastSeenTime: number = 0;
        if (typeof data.lastSeen === 'number') {
          lastSeenTime = data.lastSeen;
        } else if (data.lastSeen && typeof data.lastSeen.toMillis === 'function') {
          lastSeenTime = data.lastSeen.toMillis();
        } else if (data.lastSeen && typeof data.lastSeen.seconds === 'number') {
          lastSeenTime = data.lastSeen.seconds * 1000;
        } else {
          isOnline = false;
        }
        if (lastSeenTime) {
          const now = Date.now();
          const fiveMinutesAgo = now - 5 * 60 * 1000;
          isOnline = lastSeenTime > fiveMinutesAgo;
        }
      }

      users.push({
        user_id: userId,
        name: userName,
        photos: photos,
        photo1_url: photos[0],
        photo2_url: photos[1],
        photo3_url: photos[2],
        photo4_url: photos[3],
        profile_picture_url: photos[0], // Use first photo as profile picture
        country: data.country,
        // Map other fields if they exist
        age: data.age,
        gender: data.gender as "male" | "female" | "other" | undefined,
        bio: data.bio,
        vip: data.vip === true,
        isOnline: isOnline,
        lastSeen: data.lastSeen,
        // Map host-related fields
        isHost: data.isHost === true,
        pricePerMinute: typeof data.pricePerMinute === 'number' ? data.pricePerMinute : undefined,
        isHidden: data.isHidden === true,
        hidePrice: data.hidePrice === true,
        // Map featured fields
        isFeatured: data.isFeatured === true,
        featuredGif: data.featuredGif || undefined,
        language: data.language,
        lookingFor: data.customization?.lookingFor || data.lookingFor,
        dob: data.dob,
        customization: data.customization,
      });
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

