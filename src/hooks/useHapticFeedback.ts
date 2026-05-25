/**
 * Hook for triggering haptic feedback using the Vibration API
 * Provides feature detection and graceful degradation
 */

interface HapticFeedback {
  trigger: (duration: number) => void;
  isSupported: boolean;
}

export function useHapticFeedback(): HapticFeedback {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  
  const trigger = (duration: number) => {
    if (isSupported) {
      navigator.vibrate(duration);
    }
  };
  
  return { trigger, isSupported };
}
