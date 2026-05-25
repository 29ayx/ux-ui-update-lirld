import { createSignal, onMount, onCleanup } from "solid-js";

interface SocialProofCounterProps {
  baseCount?: number;
}

export default function SocialProofCounter(props: SocialProofCounterProps) {
  const [count, setCount] = createSignal(props.baseCount || 247);
  const [isTransitioning, setIsTransitioning] = createSignal(false);

  onMount(() => {
    const interval = setInterval(() => {
      // Trigger fade transition
      setIsTransitioning(true);
      
      // Update count with ±10% variance after a brief delay
      setTimeout(() => {
        const baseCount = props.baseCount || 247;
        const variance = Math.floor(Math.random() * (baseCount * 0.2)) - baseCount * 0.1;
        setCount(prev => Math.max(100, Math.floor(prev + variance)));
        setIsTransitioning(false);
      }, 150);
    }, 10000); // Update every 10 seconds

    onCleanup(() => clearInterval(interval));
  });

  return (
    <div
      class="flex items-center gap-2 px-3 mb-3 rounded-xl transition-opacity duration-300"
      style={{
        height: "20px",
        background: "rgba(255, 255, 255, 0.1)",
        "backdrop-filter": "blur(10px)",
        opacity: isTransitioning() ? 0.7 : 1,
      }}
    >
      <span
        class="pulse-dot"
        style={{
          width: "8px",
          height: "8px",
          background: "#10B981",
          "border-radius": "50%",
          display: "inline-block",
        }}
      />
      <span class="text-xs text-white/90">
        {count()} people viewing now
      </span>
    </div>
  );
}
