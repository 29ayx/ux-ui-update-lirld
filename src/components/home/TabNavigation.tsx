import { For } from "solid-js";

export type TabType = "discover" | "nearby" | "speed-date" | "online" | "explore";

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export default function TabNavigation(props: TabNavigationProps) {
    const tabs: { id: TabType; label: string; icon: string }[] = [
        { id: "discover", label: "Discover", icon: "✨" },
        { id: "nearby", label: "Nearby", icon: "📍" },
        { id: "speed-date", label: "Speed Date", icon: "⚡️" },
        { id: "online", label: "Online", icon: "🟢" },
        { id: "explore", label: "Explore", icon: "🧭" },
    ];

    return (
        <div class="mb-8 mt-2 px-4 sm:px-6 lg:px-8">
            <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                <For each={tabs}>
                    {(tab) => (
                        <button
                            onClick={() => props.onTabChange(tab.id)}
                            class={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap border ${
                                props.activeTab === tab.id
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105"
                                    : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                            }`}
                        >
                            <span class="text-lg">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    )}
                </For>
            </div>
        </div>
    );
}
