import { createSignal, Show, createEffect } from "solid-js";

export interface DynamicIslandProps {
  message: {
    text: string;
    senderName: string;
    senderPhoto: string;
  } | null;
  isVisible: boolean;
  onClick?: () => void;
}

export default function DynamicIsland(props: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = createSignal(false);

  createEffect(() => {
    if (props.isVisible) {
      setTimeout(() => setIsExpanded(true), 50);
    } else {
      setIsExpanded(false);
    }
  });

  return (
    <div
      class="flex flex-col items-center w-full pointer-events-auto cursor-pointer perspective-1000"
      onClick={props.onClick}
    >

    </div>
  );
}
