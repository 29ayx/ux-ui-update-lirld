import { onMount, onCleanup, createSignal } from "solid-js";

export interface InfiniteScrollOptions {
  threshold?: number; // Default: 1.5 (150% viewport)
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useInfiniteScroll(options: InfiniteScrollOptions) {
  const [loading, setLoading] = createSignal(false);
  let sentinelRef: HTMLDivElement | undefined;

  onMount(() => {
    if (!sentinelRef) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && options.hasMore && !loading()) {
          setLoading(true);
          try {
            await options.onLoadMore();
          } catch (error) {
            console.error("Failed to load more content:", error);
          } finally {
            setLoading(false);
          }
        }
      },
      {
        rootMargin: `${(options.threshold ?? 1.5) * 100}% 0px`,
      }
    );

    observer.observe(sentinelRef);

    onCleanup(() => {
      observer.disconnect();
    });
  });

  return {
    loading,
    sentinelRef: (el: HTMLDivElement) => {
      sentinelRef = el;
    },
  };
}
