import { Show, createSignal } from "solid-js";
import type { Timestamp } from "firebase/firestore";

interface HostStatusCardProps {
  status: "pending" | "approved" | "rejected";
  pricePerMinute: number;
  appliedAt: Timestamp;
  onWithdraw?: () => void;
}

export default function HostStatusCard(props: HostStatusCardProps) {
  const [isWithdrawing, setIsWithdrawing] = createSignal(false);

  const formatDate = (timestamp: Timestamp): string => {
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const handleWithdraw = async () => {
    if (!props.onWithdraw) return;
    setIsWithdrawing(true);
    try {
      await props.onWithdraw();
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getStatusConfig = () => {
    switch (props.status) {
      case "pending":
        return {
          title: "Under Review",
          message: "Your application is being reviewed",
          emoji: "⏳",
        };
      case "approved":
        return {
          title: "Approved!",
          message: "You're now a host",
          emoji: "✅",
        };
      case "rejected":
        return {
          title: "Not Approved",
          message: "You may reapply in the future",
          emoji: "❌",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div class="bg-[#111] rounded-2xl p-5 space-y-4">
      <div class="flex items-start gap-3">
        <div class="text-2xl">{config.emoji}</div>
        <div class="flex-1">
          <h3 class="text-white font-bold text-base">{config.title}</h3>
          <p class="text-white/60 text-sm">{config.message}</p>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-white/60 text-sm">Price</span>
          <span class="text-white font-semibold">{formatPrice(props.pricePerMinute)}/min</span>
        </div>
        <div class="flex justify-between">
          <span class="text-white/60 text-sm">Applied</span>
          <span class="text-white text-sm">{formatDate(props.appliedAt)}</span>
        </div>
      </div>

      <Show when={props.status === "pending" && props.onWithdraw}>
        <button
          onClick={handleWithdraw}
          disabled={isWithdrawing()}
          class="w-full px-4 py-3 bg-red-500/20 text-red-400 font-semibold rounded-xl disabled:opacity-50"
        >
          {isWithdrawing() ? "Withdrawing..." : "Withdraw Application"}
        </button>
      </Show>
    </div>
  );
}
