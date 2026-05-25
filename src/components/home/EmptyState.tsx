interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState(props: EmptyStateProps) {
  return (
    <div class="text-center text-white/60 py-12">
      <div class="inline-block p-6 rounded-2xl bg-[#111]">
        {props.icon && <span class="text-4xl mb-3 block">{props.icon}</span>}
        <p class="text-base font-medium mb-2">{props.title}</p>
        {props.subtitle && <p class="text-sm text-white/40">{props.subtitle}</p>}
      </div>
    </div>
  );
}
