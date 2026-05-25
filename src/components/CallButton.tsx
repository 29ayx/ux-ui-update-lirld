import { Show, createSignal, createResource } from "solid-js";
import { HiSolidPhone } from "solid-icons/hi";
import { useAuth } from "~/lib/auth";
import { initiateCall } from "~/lib/calls";
import { hasSufficientCredits } from "~/lib/billing";
import LoadingSpinner from "~/components/LoadingSpinner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "~/lib/firebase";

interface CallButtonProps {
  targetUserId: string;
  targetUserName?: string;
  context: 'profile' | 'chat' | 'general';
  pricePerMinute?: number;
  isFree?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'icon';
  onCallInitiated?: (callId: string) => void;
  onError?: (error: string) => void;
}

export default function CallButton(props: CallButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Fetch callee's price if not provided
  const [calleeData] = createResource(
    () => props.pricePerMinute === undefined ? props.targetUserId : null,
    async (userId) => {
      if (!userId) return null;
      try {
        const calleeDoc = await getDoc(doc(db, 'users', userId));
        if (calleeDoc.exists()) {
          const data = calleeDoc.data();
          return {
            pricePerMinute: typeof data.pricePerMinute === 'number' ? data.pricePerMinute : 0
          };
        }
      } catch (err) {
        console.error('Error fetching callee price:', err);
      }
      return null;
    }
  );

  // Get price per minute - use prop if provided, otherwise use fetched data, default to 0
  const pricePerMinute = () => {
    if (props.pricePerMinute !== undefined) {
      return props.pricePerMinute;
    }
    return calleeData()?.pricePerMinute ?? 0;
  };

  // Determine if call is free based on actual price (pricePerMinute > 0 = paid call)
  const isFree = () => {
    if (props.isFree !== undefined) {
      return props.isFree;
    }
    return pricePerMinute() === 0;
  };

  // Size classes
  const sizeClasses = () => {
    switch (props.size) {
      case 'small':
        return 'h-8 px-3 text-xs';
      case 'large':
        return 'h-12 px-6 text-base';
      case 'medium':
      default:
        return 'h-10 px-4 text-sm';
    }
  };

  // Variant classes
  const variantClasses = () => {
    const baseClasses = 'transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed touch-manipulation';
    
    switch (props.variant) {
      case 'secondary':
        return `${baseClasses} bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 active:scale-95`;
      case 'icon':
        return `${baseClasses} bg-green-500/90 backdrop-blur-md text-white border border-white/20 hover:bg-green-500 active:scale-95 rounded-full aspect-square p-0`;
      case 'primary':
      default:
        return `${baseClasses} bg-green-500/90 backdrop-blur-md text-white border border-white/20 hover:bg-green-500 active:scale-95 shadow-xl`;
    }
  };

  const handleCall = async () => {
    const currentUser = user();
    if (!currentUser || loading()) return;

    // Clear previous error
    setError(null);
    setLoading(true);

    try {
      // Check if calling self
      if (currentUser.uid === props.targetUserId) {
        throw new Error('Cannot call yourself');
      }

      // Check credits if it's a paid call (pricePerMinute > 0)
      const actualPrice = pricePerMinute();
      if (actualPrice > 0) {
        const hasCredits = await hasSufficientCredits(
          currentUser.uid,
          actualPrice,
          1 // Check for at least 1 minute
        );

        if (!hasCredits) {
          throw new Error(`Insufficient credits. This call costs ${actualPrice} credits per minute. Please add credits to make this call.`);
        }
      }

      // Initiate the call
      const callId = await initiateCall(
        currentUser.uid,
        props.targetUserId,
        props.context
      );

      // Notify parent component
      props.onCallInitiated?.(callId);

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to initiate call';
      setError(errorMessage);
      props.onError?.(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Phone icon component
  const PhoneIcon = () => (
    <HiSolidPhone class={props.variant === 'icon' ? 'w-5 h-5' : 'w-4 h-4'} />
  );

  return (
    <div class="relative">
      <button
        onClick={handleCall}
        disabled={loading() || !user()}
        class={`
          ${sizeClasses()}
          ${variantClasses()}
          rounded-xl
          flex items-center justify-center gap-2
          font-semibold
        `}
        aria-label={`Call ${props.targetUserName || 'user'}`}
        title={isFree() ? 'Free Call' : `Call at ${pricePerMinute()} credits/min`}
      >
        <Show when={loading()} fallback={<PhoneIcon />}>
          <LoadingSpinner size="sm" />
        </Show>
        
        <Show when={props.variant !== 'icon'}>
          <span>
            <Show when={isFree()} fallback="Call">
              Free Call
            </Show>
          </span>
        </Show>
      </button>

      {/* Error message tooltip */}
      <Show when={error()}>
        <div class="absolute top-full left-0 right-0 mt-2 z-50 animate-in slide-in-from-top-2">
          <div class="bg-red-500/90 backdrop-blur-md text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-red-400/20">
            {error()}
          </div>
        </div>
      </Show>
    </div>
  );
}
