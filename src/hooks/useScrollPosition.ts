import { createSignal, onMount, onCleanup } from "solid-js";

/**
 * Hook for tracking scroll position with passive event listener
 * Returns current vertical scroll position in pixels
 */

export function useScrollPosition() {
  const [scrollY, setScrollY] = createSignal(0);
  
  onMount(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    // Set initial value
    handleScroll();
    
    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    onCleanup(() => {
      window.removeEventListener("scroll", handleScroll);
    });
  });
  
  return scrollY;
}
