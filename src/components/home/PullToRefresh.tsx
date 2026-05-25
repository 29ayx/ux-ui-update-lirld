import { createSignal, JSXElement, onCleanup } from "solid-js";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: JSXElement;
}

export default function PullToRefresh(props: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = createSignal(0);
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);
  
  const maxPull = 150; // dp
  const threshold = 100; // dp
  
  let startY = 0;
  let startScrollY = 0;
  let isDragging = false;

  const handleTouchStart = (e: TouchEvent) => {
    // Only enable pull-to-refresh when at the top of the page
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
      startScrollY = window.scrollY;
      isDragging = true;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || isRefreshing()) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Only allow pulling down when at the top
    if (deltaY > 0 && window.scrollY === 0) {
      // Prevent default scroll behavior
      e.preventDefault();
      
      // Apply elastic resistance - the further you pull, the harder it gets
      const resistance = 0.5;
      const distance = Math.min(deltaY * resistance, maxPull);
      
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging) return;
    isDragging = false;
    
    if (pullDistance() >= threshold && !isRefreshing()) {
      setIsRefreshing(true);
      
      try {
        await props.onRefresh();
        
        // Show success indicator
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setPullDistance(0);
          setIsRefreshing(false);
        }, 500);
      } catch (error) {
        console.error("Refresh failed:", error);
        setPullDistance(0);
        setIsRefreshing(false);
      }
    } else {
      // Animate back to original position
      setPullDistance(0);
    }
  };

  // Add event listeners
  if (typeof window !== "undefined") {
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    
    onCleanup(() => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    });
  }

  const getIndicatorOpacity = () => {
    if (showSuccess()) return 1;
    return Math.min(pullDistance() / threshold, 1);
  };

  const getIndicatorText = () => {
    if (showSuccess()) return "✓ Refreshed!";
    if (isRefreshing()) return "Refreshing...";
    return "Pull to refresh";
  };

  return (
    <div
      style={{
        transform: `translateY(${pullDistance()}px)`,
        transition: isRefreshing() || pullDistance() === 0
          ? "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
          : "none"
      }}
    >
      {/* Refresh Indicator */}
      <div
        class="flex justify-center items-center py-4"
        style={{
          opacity: getIndicatorOpacity(),
          transition: "opacity 0.2s ease-out"
        }}
      >
        <div class="flex items-center gap-2 text-white/80 text-sm">
          {isRefreshing() && !showSuccess() && (
            <svg
              class="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          <span>{getIndicatorText()}</span>
        </div>
      </div>

      {/* Content */}
      {props.children}
    </div>
  );
}
