/**
 * Profile Type Definitions
 * 
 * TypeScript interfaces for profile-related data structures.
 * These types match the Firestore schema and ensure type safety
 * throughout the profile feature.
 * 
 * @module types/profile
 */

/**
 * Zodiac sign information with date ranges
 * Used for calculating and displaying user's astrological sign
 */
export interface ZodiacSign {
  /** Name of the zodiac sign (e.g., "Aries", "Taurus") */
  name: string;
  /** Emoji representation of the zodiac sign */
  emoji: string;
  /** Date range for the zodiac sign: [[startMonth, startDay], [endMonth, endDay]] */
  dates: [[number, number], [number, number]];
}

/**
 * Birthday information including countdown
 * Calculated from user's date of birth
 */
export interface BirthdayInfo {
  /** Full month name (e.g., "January") */
  month: string;
  /** Day of the month (1-31) */
  day: number;
  /** Number of days until next birthday */
  daysUntil: number;
}

/**
 * Room customization data
 * Controls the visual theme and appearance of the profile
 */
export interface RoomData {
  /** Theme preset (e.g., "minimal", "night", "sunset", "ocean") */
  theme: string;
  /** CSS gradient string for background */
  background: string;
  /** Frame style around profile photo (e.g., "minimal", "none", "elegant", "modern") */
  frame: string;
  /** Animation effect (e.g., "none", "sparkles", "stars", "hearts", "particles", "rainbow") */
  animation: string;
}

/**
 * Vibe/mood indicator
 * Optional emoji-based mood display
 */
export interface VibeData {
  /** Emoji representing the vibe */
  emoji: string;
  /** Name/description of the vibe */
  name: string;
}

/**
 * Social media post data
 * Represents a single post on the user's profile
 */
export interface Post {
  /** Optional image URL for the post */
  image?: string;
  /** Post caption/text content */
  caption?: string;
  /** Relative time string (e.g., "2 hours ago") */
  timeAgo?: string;
  /** Number of likes on the post */
  likes?: number;
  /** Number of comments on the post */
  comments?: number;
}

/**
 * Profile customization settings
 * User-configurable appearance and display options
 */
export interface ProfileCustomization {
  /** Room/theme customization data (may be stored as JSON string in Firestore) */
  room: RoomData | string;
  /** Optional vibe/mood indicator (may be stored as JSON string in Firestore) */
  vibe?: VibeData | string | null;
  /** Custom badge text to display on profile */
  badgeText?: string;
  /** Array of "looking for" items (e.g., ["Friends", "Chat", "Gaming"]) */
  lookingFor?: string[];
}

/**
 * Complete profile data structure
 * Main interface representing all user profile information from Firestore
 */
export interface ProfileData {
  /** User's display name */
  name?: string;
  /** Date of birth in ISO format (YYYY-MM-DD) */
  dob?: string;
  /** Country name */
  country?: string;
  /** Primary language */
  language?: string;
  /** Array of photo URLs */
  photos?: string[];
  /** Array of social media posts */
  posts?: Post[];
  /** Profile customization settings */
  customization?: ProfileCustomization;
  /** Whether to show custom badge */
  showCustomBadge?: boolean;
  /** Whether to show days until birthday */
  showDaysToBirthday?: boolean;
  /** Whether to show birthday card */
  showBirthdayCard?: boolean;
  /** Whether user is a host */
  isHost?: boolean;
  /** Price per minute for host calls (in cents or smallest currency unit) */
  pricePerMinute?: number;
}
