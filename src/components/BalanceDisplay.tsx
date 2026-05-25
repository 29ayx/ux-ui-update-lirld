import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '~/lib/firebase';
import { useAuth } from '~/lib/auth';

export default function BalanceDisplay() {
  const { user } = useAuth();
  const [balance, setBalance] = createSignal<number | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  onMount(() => {
    const currentUser = user();
    if (!currentUser) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }

    // Subscribe to user document for real-time balance updates
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setBalance(userData.credits ?? 0);
          setError(null);
        } else {
          setError('User data not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching balance:', err);
        setError('Failed to load balance');
        setLoading(false);
      }
    );

    onCleanup(() => {
      unsubscribe();
    });
  });

  return (
    <Show when={user()}>
      <div class="fixed top-20 right-4 z-40">
        <div class="bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-lg px-4 py-2 min-w-[100px]">
          <Show
            when={!loading()}
            fallback={
              <div class="flex items-center justify-center gap-2">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span class="text-sm text-gray-300">Loading...</span>
              </div>
            }
          >
            <Show
              when={!error()}
              fallback={
                <div class="flex items-center justify-center">
                  <span class="text-sm text-red-400">Error</span>
                </div>
              }
            >
              <div class="flex items-center justify-center gap-2">
                <span class="text-lg">💎</span>
                <span class="text-white font-semibold">{balance()?.toFixed(1)}</span>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </Show>
  );
}
