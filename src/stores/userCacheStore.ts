import { createSignal } from "solid-js";
import { fetchUsers, type UserProfileWithOnlineStatus } from "~/lib/users";

const USERS_PER_PAGE = 20;

// Global state that persists across route changes
const [users, setUsers] = createSignal<UserProfileWithOnlineStatus[]>([]);
const [loading, setLoading] = createSignal(false);
const [hasMore, setHasMore] = createSignal(true);
const [error, setError] = createSignal<Error | null>(null);
const [initialized, setInitialized] = createSignal(false);

// Track all loaded user IDs to prevent duplicates
const loadedUserIds = new Set<string>();

// Fisher-Yates shuffle algorithm for randomizing array order
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getUserCacheStore() {
  const loadInitialUsers = async (uid?: string) => {
    if (initialized() || loading()) return; // Don't reload if already initialized or loading

    setLoading(true);
    setError(null);
    try {
      const fetchedUsers = await fetchUsers(uid);

      // Clear previous data
      loadedUserIds.clear();

      // Shuffle users for random order
      const shuffledUsers = shuffleArray(fetchedUsers);

      // Add users and track IDs
      shuffledUsers.forEach(user => loadedUserIds.add(user.user_id));

      setUsers(shuffledUsers);
      setHasMore(fetchedUsers.length >= USERS_PER_PAGE);
      setInitialized(true);
    } catch (err) {
      setError(err as Error);
      console.error("Error loading initial users:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async (uid?: string) => {
    if (loading() || !hasMore()) return;

    setLoading(true);
    setError(null);

    try {
      const currentUsers = users();
      const lastUserId = currentUsers[currentUsers.length - 1]?.user_id;

      const newUsers = await fetchUsers(uid, USERS_PER_PAGE, lastUserId);

      // Filter out duplicates
      const uniqueNewUsers = newUsers.filter(user => {
        if (loadedUserIds.has(user.user_id)) {
          return false;
        }
        loadedUserIds.add(user.user_id);
        return true;
      });

      // Shuffle new users before adding them
      const shuffledNewUsers = shuffleArray(uniqueNewUsers);

      if (shuffledNewUsers.length > 0) {
        setUsers(prev => [...prev, ...shuffledNewUsers]);
      }

      // If we got fewer users than requested, we've reached the end
      setHasMore(newUsers.length >= USERS_PER_PAGE);
    } catch (err) {
      setError(err as Error);
      console.error("Error loading more users:", err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async (uid?: string) => {

    setInitialized(false); // Reset initialized flag to allow refresh
    await loadInitialUsers(uid);
  };

  return {
    users,
    loading,
    hasMore,
    error,
    initialized,
    loadInitialUsers,
    loadMore,
    refresh,
  };
}
