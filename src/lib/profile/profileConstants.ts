/**
 * Profile Constants
 * 
 * All constants, default values, and configuration for profile features.
 * Centralized for easy maintenance and updates.
 * 
 * @module lib/profile/profileConstants
 */

import type { ZodiacSign, RoomData, ProfileCustomization } from "~/types/profile";

/**
 * Zodiac signs with date ranges
 * Used for calculating user's zodiac sign from date of birth
 * 
 * Date format: [[startMonth, startDay], [endMonth, endDay]]
 * Months are 1-indexed (1 = January, 12 = December)
 */
export const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: "Capricorn", emoji: "♑", dates: [[12, 22], [1, 19]] },
  { name: "Aquarius", emoji: "♒", dates: [[1, 20], [2, 18]] },
  { name: "Pisces", emoji: "♓", dates: [[2, 19], [3, 20]] },
  { name: "Aries", emoji: "♈", dates: [[3, 21], [4, 19]] },
  { name: "Taurus", emoji: "♉", dates: [[4, 20], [5, 20]] },
  { name: "Gemini", emoji: "♊", dates: [[5, 21], [6, 20]] },
  { name: "Cancer", emoji: "♋", dates: [[6, 21], [7, 22]] },
  { name: "Leo", emoji: "♌", dates: [[7, 23], [8, 22]] },
  { name: "Virgo", emoji: "♍", dates: [[8, 23], [9, 22]] },
  { name: "Libra", emoji: "♎", dates: [[9, 23], [10, 22]] },
  { name: "Scorpio", emoji: "♏", dates: [[10, 23], [11, 21]] },
  { name: "Sagittarius", emoji: "♐", dates: [[11, 22], [12, 21]] },
];

/**
 * Default room customization data
 * Used when user hasn't set custom room settings or when data is invalid
 * 
 * - theme: Visual theme preset
 * - background: CSS gradient string for background styling
 * - frame: Border/frame style around profile photo
 * - animation: Animation effect for profile decorations
 */
export const DEFAULT_ROOM_DATA: RoomData = {
  theme: "minimal",
  background: "from-[#E3F2FD] via-white to-[#B3E5FC]/30",
  frame: "minimal",
  animation: "none",
};

/**
 * Default profile customization
 * Used for new users or when customization data is missing/invalid
 * 
 * Provides safe fallback values to prevent rendering errors
 */
export const DEFAULT_CUSTOMIZATION: ProfileCustomization = {
  room: DEFAULT_ROOM_DATA,
  vibe: null,
  badgeText: "",
  lookingFor: [],
};

/**
 * Security and validation limits
 * Enforces maximum values to prevent abuse and ensure performance
 * 
 * These limits protect against:
 * - Excessive data storage
 * - Performance degradation from large arrays
 * - Potential DoS attacks through data flooding
 */
export const LIMITS = {
  /** Maximum number of photos a user can have */
  MAX_PHOTOS: 10,
  /** Maximum number of posts to display */
  MAX_POSTS: 50,
  /** Maximum number of "looking for" items */
  MAX_LOOKING_FOR_ITEMS: 10,
  /** Maximum length of custom badge text */
  MAX_BADGE_TEXT_LENGTH: 50,
  /** Maximum length of post captions */
  MAX_CAPTION_LENGTH: 500,
  /** Maximum price per minute for host calls (in cents) */
  MAX_PRICE_PER_MINUTE: 1000,
} as const;
