import { useNavigate } from "@solidjs/router";
import type { PriorityActivity } from "~/hooks/useRecentActivity";
import { openProfile } from "~/lib/profileStore";

interface PriorityCardProps {
  activity: PriorityActivity;
}

export default function PriorityCard(props: PriorityCardProps) {
  const navigate = useNavigate();

  const timeAgo = () => {
    const minutes = Math.floor((Date.now() - props.activity.timestamp) / 60000);
    if (minutes < 1) return "just now";
    if (minutes === 1) return "1 min ago";
    return `${minutes} min ago`;
  };

  const actionText = () => {
    return props.activity.action === "wave" ? "waved" : "messaged";
  };

  const handleTap = () => {
    // Navigate to chat if it's a message, otherwise to profile
    if (props.activity.action === "message") {
      navigate("/chats");
    } else {
      openProfile(props.activity.userId);
    }
  };

  return (
    <div
      onClick={handleTap}
      class="relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{ "aspect-ratio": "1 / 1.6" }}
    >
      {/* Gradient border animation */}
      <div class="absolute inset-0 rounded-3xl p-[2px] gradient-border-animated">
        <div class="h-full w-full rounded-3xl bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div class="relative z-10 flex h-full flex-col p-4">
        {/* User photo */}
        <div class="mb-3 flex-shrink-0">
          <div class="h-16 w-16 overflow-hidden rounded-full border-2 border-white/30">
            {props.activity.photoUrl ? (
              <img
                src={props.activity.photoUrl}
                alt={props.activity.userName}
                class="h-full w-full object-cover"
              />
            ) : (
              <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold text-white">
                {props.activity.userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Text content */}
        <div class="flex flex-1 flex-col justify-center">
          <h3 class="mb-1 text-lg font-semibold text-white">
            {props.activity.userName}
          </h3>
          <p class="mb-2 text-sm text-white/90">
            {actionText()} at you
          </p>
          <span class="text-xs text-white/70">{timeAgo()}</span>
        </div>

        {/* Action indicator */}
        <div class="flex-shrink-0">
          <div class="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {props.activity.action === "wave" ? "👋" : "💬"}
            <span>Tap to respond</span>
          </div>
        </div>
      </div>
    </div>
  );
}
