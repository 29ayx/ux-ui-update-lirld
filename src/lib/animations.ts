/**
 * Animation utilities for home engagement features
 * Provides timing functions, durations, and haptic patterns
 */

export const animations = {
  // Timing functions
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  
  // Durations (in milliseconds)
  fast: 200,
  normal: 300,
  slow: 400,
  
  // Haptic patterns (in milliseconds)
  haptic: {
    light: 30,
    medium: 50,
    heavy: 70
  }
} as const;
