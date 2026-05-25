import { createEffect } from "solid-js";
import { getUserCacheStore } from "~/stores/userCacheStore";

export function useUserCache(currentUserId: () => string | undefined, options?: { isPublic?: boolean }) {
  const store = getUserCacheStore();

  // Load initial users only once when currentUserId is first available or if public
  createEffect(() => {
    const uid = currentUserId();
    if ((uid || options?.isPublic) && !store.initialized()) {
      store.loadInitialUsers(uid);
    }
  });

  return {
    users: store.users,
    loading: store.loading,
    hasMore: store.hasMore,
    error: store.error,
    loadMore: async () => {
      const uid = currentUserId();
      if (uid || options?.isPublic) {
        await store.loadMore(uid);
      }
    },
    refresh: async () => {
      const uid = currentUserId();
      if (uid || options?.isPublic) {
        await store.refresh(uid);
      }
    },
  };
}
