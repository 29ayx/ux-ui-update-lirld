import { createSignal, For, Show } from "solid-js";
import { usePlans, type Plan } from "~/lib/plans";
import { useAuth } from "~/lib/auth";
import { addCredits } from "~/lib/billing";
import { IoCheckmarkCircle, IoWallet } from "solid-icons/io";
import MarketingBanner from "~/components/MarketingBanner";
import { Title, Meta } from "@solidjs/meta";

export default function Plans() {
    const { plans, loading } = usePlans();
    const { user } = useAuth();
    const [purchasing, setPurchasing] = createSignal<string | null>(null);
    const [message, setMessage] = createSignal<{ text: string; type: "success" | "error" } | null>(null);

    const handleBuy = async (plan: Plan) => {
        if (!user()) {
            setMessage({ text: "Please log in to purchase plans.", type: "error" });
            return;
        }

        setPurchasing(plan.id);
        setMessage(null);

        try {
            // Simulate payment processing delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Add credits to user account
            await addCredits(user()!.uid, plan.coins, `Purchase: ${plan.items}`);

            setMessage({ text: `Successfully purchased ${plan.coins} coins!`, type: "success" });
        } catch (error) {
            console.error("Purchase failed:", error);
            setMessage({ text: "Purchase failed. Please try again.", type: "error" });
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <main class="min-h-screen bg-whitedark:bg-black pb-8">
            <Title>Plans & Pricing - Lirld</Title>
            <Meta name="description" content="Choose the best plan for you on Lirld. Get more credits and unlock premium features." />
            <header class="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-400/30 dark:border-gray-800">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                    <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                        Choose Your Plan
                    </h1>
                </div>
            </header>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="mb-8">
                    <MarketingBanner type="plans_banner" />
                </div>
                <Show when={message()}>
                    <div
                        class={`mb-8 max-w-md mx-auto p-4 rounded-xl border ${message()?.type === "success"
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                            }`}
                    >
                        <div class="flex items-center gap-3">
                            <div class="flex-shrink-0">
                                <Show when={message()?.type === "success"}>
                                    <IoCheckmarkCircle class="h-5 w-5 text-green-500 dark:text-green-400" />
                                </Show>
                            </div>
                            <p class="text-sm font-medium">{message()?.text}</p>
                        </div>
                    </div>
                </Show>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    <Show when={loading()}>
                        <div class="col-span-full flex justify-center py-20">
                            <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-500"></div>
                        </div>
                    </Show>

                    <For each={plans()}>
                        {(plan) => (
                            <div class="group relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                {/* Gradient Overlay */}
                                <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div class="relative p-6 sm:p-8 flex flex-col h-full">
                                    <div class="mb-4">
                                        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                            {plan.items}
                                        </h3>
                                        <div class="flex items-baseline gap-1">
                                            <span class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                ${plan.price}
                                            </span>
                                            <span class="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                /one-time
                                            </span>
                                        </div>
                                    </div>

                                    <div class="flex items-center gap-3 py-4 border-t border-slate-200 dark:border-slate-800 mt-auto mb-6">
                                        <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                            <IoWallet class="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Includes</p>
                                            <p class="text-lg font-bold text-indigo-600 dark:text-indigo-400">{plan.coins} Coins</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleBuy(plan)}
                                        disabled={!!purchasing()}
                                        class={`
                                            w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide
                                            transition-all duration-200 transform active:scale-[0.98]
                                            ${purchasing() === plan.id
                                                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40"
                                            }
                                        `}
                                    >
                                        {purchasing() === plan.id ? (
                                            <div class="flex items-center justify-center gap-2">
                                                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Processing...</span>
                                            </div>
                                        ) : (
                                            "Buy Plan"
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </For>
                </div>
            </div>
        </main>
    );
}
