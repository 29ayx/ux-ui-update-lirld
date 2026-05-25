import { HiSolidPhone } from 'solid-icons/hi';

type CallFilter = 'all' | 'missed' | 'incoming' | 'outgoing';

interface EmptyStateProps {
  filter?: CallFilter;
}

export default function EmptyState(props: EmptyStateProps) {
  const messages: Record<CallFilter, { title: string; subtitle: string }> = {
    all: {
      title: 'No calls yet',
      subtitle: 'Your call history will appear here'
    },
    missed: {
      title: 'No missed calls',
      subtitle: 'Great job! You are up to date'
    },
    incoming: {
      title: 'No incoming calls',
      subtitle: 'You will see new calls here'
    },
    outgoing: {
      title: 'No outgoing calls',
      subtitle: 'You have not placed any calls yet'
    }
  };

  const currentFilter = props.filter ?? 'all';
  const { title, subtitle } = messages[currentFilter];

  return (
    <div class="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <div class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
        <HiSolidPhone class="w-10 h-10 text-slate-800 dark:text-white" />
      </div>
      <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">{title}</h2>
      <p class="text-slate-800 dark:text-white">{subtitle}</p>
    </div>
  );
}
