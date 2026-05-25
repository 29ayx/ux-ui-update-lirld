import { HiOutlineArrowPath } from "solid-icons/hi";
import { JSX } from "solid-js";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
  class?: string;
}

export default function LoadingSpinner(props: LoadingSpinnerProps): JSX.Element {
  // Size mapping to Tailwind classes
  const sizeClasses = () => {
    switch (props.size) {
      case "xs":
        return "w-3 h-3";
      case "sm":
        return "w-4 h-4";
      case "md":
        return "w-5 h-5";
      case "lg":
        return "w-6 h-6";
      case "xl":
        return "w-8 h-8";
      default:
        return "w-5 h-5"; // Default to medium
    }
  };

  // Color class (defaults to current text color)
  const colorClass = () => props.color || "text-current";

  return (
    <HiOutlineArrowPath
      class={`${sizeClasses()} ${colorClass()} animate-spin ${props.class || ""}`}
      aria-label="Loading"
      aria-hidden="false"
    />
  );
}
