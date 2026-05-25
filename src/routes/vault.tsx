import { Component, createSignal, For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { IoArrowBack, IoWallet, IoDiamond, IoGift, IoInformationCircle } from 'solid-icons/io';
import { LUXURY_ITEMS, LuxuryItem } from '../features/luxury/items';

const Vault: Component = () => {
    const [balance, setBalance] = createSignal(100000);
    const [activeTab, setActiveTab] = createSignal<'all' | 'status' | 'gift'>('all');

    const filteredItems = () => {
        if (activeTab() === 'all') return LUXURY_ITEMS;
        return LUXURY_ITEMS.filter(item => item.category === activeTab());
    };

    const handleBuy = (item: LuxuryItem) => {
        if (balance() >= item.price) {
            setBalance(prev => prev - item.price);
            // Logic for adding to inventory would go here
            alert(`Success! You purchased ${item.name}.`);
        } else {
            alert("Insufficient funds in your Vault.");
        }
    };

    return (
        <div class="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white pb-24">
            {/* Header Section */}
            <header class="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 py-4">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <A href="/" class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </A>
                        <h1 class="text-xl font-black tracking-tighter uppercase italic">The Vault</h1>
                    </div>

                    {/* Balance Badge */}
                    <div class="bg-gradient-to-r from-amber-400 to-amber-600 px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/20 flex items-center gap-2 border border-amber-300/30">
                        <span class="text-[10px] font-black text-amber-950 uppercase tracking-widest">Balance</span>
                        <span class="text-sm font-black text-amber-950 leading-none">${balance().toLocaleString()}</span>
                    </div>
                </div>
            </header>

            <main class="py-6 sm:py-8 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Intro Card */}
                <div class="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white shadow-2xl shadow-indigo-500/20 group">
                    <div class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                    <div class="relative z-10 space-y-2">
                        <h2 class="text-3xl font-black italic tracking-tighter leading-tight">YOU ARE RICH.</h2>
                        <p class="text-indigo-100 text-sm font-medium max-w-[240px] leading-relaxed opacity-80">
                            Welcome to world-class luxury. Spend your 100k starting bonus on status items and gifts.
                        </p>
                    </div>
                    <div class="absolute bottom-4 right-6 text-6xl opacity-20 pointer-events-none">✨</div>
                </div>

                {/* Categories */}
                <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('all')}
                        class={`shrink-0 px-6 py-2.5 rounded-full transition-all text-xs font-black uppercase tracking-widest border
              ${activeTab() === 'all'
                                ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-lg'
                                : 'bg-white dark:bg-zinc-900 text-slate-400 border-slate-100 dark:border-white/5'}`}
                    >
                        All Items
                    </button>
                    <button
                        onClick={() => setActiveTab('status')}
                        class={`shrink-0 px-6 py-2.5 rounded-full transition-all text-xs font-black uppercase tracking-widest border
              ${activeTab() === 'status'
                                ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-lg'
                                : 'bg-white dark:bg-zinc-900 text-slate-400 border-slate-100 dark:border-white/5'}`}
                    >
                        Status
                    </button>
                    <button
                        onClick={() => setActiveTab('gift')}
                        class={`shrink-0 px-6 py-2.5 rounded-full transition-all text-xs font-black uppercase tracking-widest border
              ${activeTab() === 'gift'
                                ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-lg'
                                : 'bg-white dark:bg-zinc-900 text-slate-400 border-slate-100 dark:border-white/5'}`}
                    >
                        Gifts
                    </button>
                </div>

                {/* Items Grid */}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <For each={filteredItems()}>
                        {(item) => (
                            <div class="bg-slate-50 dark:bg-zinc-900/50 rounded-[1.75rem] border border-slate-100 dark:border-white/5 p-5 group flex items-center gap-4 hover:border-amber-500/30 transition-all duration-500">
                                <div class={`w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-3xl shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-500`}>
                                    {item.icon}
                                </div>

                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between mb-0.5">
                                        <span class="text-[8px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none truncate">
                                            {item.category}
                                        </span>
                                        <span class="text-[10px] font-black text-amber-500 dark:text-amber-400 leading-none">
                                            ${item.price.toLocaleString()}
                                        </span>
                                    </div>
                                    <h3 class="text-sm font-black text-slate-900 dark:text-white mb-1 truncate">{item.name}</h3>
                                    <button
                                        onClick={() => handleBuy(item)}
                                        class="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-black dark:hover:bg-amber-400 transition-colors"
                                    >
                                        Buy Item
                                    </button>
                                </div>
                            </div>
                        )}
                    </For>
                </div>

                {/* Footer Info */}
                <div class="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-200 dark:border-amber-500/10 flex items-start gap-3">
                    <div class="text-amber-500 mt-0.5">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p class="text-[11px] text-amber-800 dark:text-amber-200/60 font-medium leading-relaxed">
                        Status items are permanently added to your profile card. Gifts can be sent to other users to increase your "Vibe Sync" score.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Vault;
