import { createSignal, onMount, Show } from "solid-js";
import { Title, Meta } from "@solidjs/meta";
import { IoShareOutline, IoAddOutline, IoPhonePortraitOutline, IoInformationCircleOutline } from "solid-icons/io";

export default function Install() {
    const [isIOS, setIsIOS] = createSignal(false);
    const [deferredPrompt, setDeferredPrompt] = createSignal<any>(null);
    const [isInstalled, setIsInstalled] = createSignal(false);

    onMount(() => {
        // iOS detection
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));

        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
        }

        // Listen for the beforeinstallprompt event (Android/Chrome)
        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });

        // Listen for the appinstalled event
        window.addEventListener("appinstalled", () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        });
    });

    const handleInstallClick = async () => {
        const prompt = deferredPrompt();
        if (prompt) {
            prompt.prompt();
            const { outcome } = await prompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
            }
        }
    };

    return (
        <main class="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <Title>Install Lirld App</Title>
            <Meta name="description" content="Install Lirld on your home screen for the best experience." />

            {/* Premium Background Gradients */}
            <div class="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-pink-500/10 dark:bg-pink-500/5 blur-[120px] animate-pulse" />
                <div class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 dark:bg-violet-600/5 blur-[120px] animate-pulse" />
            </div>

            <div class="max-w-md w-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[40px] p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700">

                {/* App Icon Mockup */}
                <div class="flex justify-center mb-8">
                    <div class="w-24 h-24 bg-gradient-to-tr from-pink-500 via-rose-500 to-violet-600 rounded-3xl shadow-xl flex items-center justify-center p-1 relative group">
                        <div class="w-full h-full bg-white dark:bg-zinc-950 rounded-[22px] flex items-center justify-center">
                            <span class="text-3xl font-black bg-gradient-to-tr from-pink-500 via-rose-500 to-violet-600 bg-clip-text text-transparent">L</span>
                        </div>
                        {/* Shimmer Effect */}
                        <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                </div>

                <div class="text-center mb-10">
                    <h1 class="text-3xl font-black tracking-tight mb-2">Lirld.com</h1>
                    <p class="text-zinc-500 dark:text-zinc-400 font-medium">Always feel connected</p>
                </div>

                <Show when={isInstalled()}>
                    <div class="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center animate-in fade-in slide-in-from-bottom-2">
                        <p class="text-green-600 dark:text-green-400 font-bold">App installed successfully!</p>
                        <p class="text-sm text-green-600/80 dark:text-green-400/80 mt-1">You can now access Lirld from your home screen.</p>
                    </div>
                </Show>

                <Show when={!isInstalled()}>
                    <div class="space-y-8">
                        {/* iOS Specific Instructions */}
                        <Show when={isIOS()}>
                            <div class="space-y-6">
                                <div class="flex items-start gap-4 p-4 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-2xl">
                                    <div class="w-10 h-10 rounded-full bg-white dark:bg-zinc-700 flex items-center justify-center shrink-0 shadow-sm">
                                        <IoShareOutline class="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-bold">Step 1</p>
                                        <p class="text-sm text-zinc-500 dark:text-zinc-400">Tap the <span class="text-zinc-900 dark:text-white font-bold italic">Share</span> button in Safari browser.</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-4 p-4 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-2xl">
                                    <div class="w-10 h-10 rounded-full bg-white dark:bg-zinc-700 flex items-center justify-center shrink-0 shadow-sm">
                                        <IoAddOutline class="w-5 h-5 text-zinc-900 dark:text-white" />
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-bold">Step 2</p>
                                        <p class="text-sm text-zinc-500 dark:text-zinc-400">Scroll down and tap <span class="text-zinc-900 dark:text-white font-bold">Add to Home Screen</span>.</p>
                                    </div>
                                </div>
                            </div>
                        </Show>

                        {/* Android/Chrome Button */}
                        <Show when={!isIOS()}>
                            <div class="space-y-4">
                                <button
                                    onClick={handleInstallClick}
                                    disabled={!deferredPrompt()}
                                    class={`w-full py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 shadow-xl flex items-center justify-center gap-3 ${deferredPrompt()
                                            ? "bg-gradient-to-r from-pink-500 via-rose-500 to-violet-600 text-white shadow-rose-500/25"
                                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                                        }`}
                                >
                                    <IoPhonePortraitOutline class="w-6 h-6" />
                                    {deferredPrompt() ? "Install Lirld App" : "App is Ready"}
                                </button>

                                <Show when={!deferredPrompt()}>
                                    <p class="text-xs text-center text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-1">
                                        <IoInformationCircleOutline class="w-4 h-4" />
                                        If the button is disabled, use your browser's "Add to Home Screen" menu.
                                    </p>
                                </Show>
                            </div>
                        </Show>

                        {/* Why install Lirld */}
                        <div class="border-t border-zinc-200 dark:border-zinc-800 pt-6">
                            <h3 class="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Why install?</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1">
                                    <div class="text-xs font-bold">Lightning Fast</div>
                                    <p class="text-[10px] text-zinc-500">Access Lirld instantly with one tap.</p>
                                </div>
                                <div class="space-y-1">
                                    <div class="text-xs font-bold">Full Screen</div>
                                    <p class="text-[10px] text-zinc-500">Enjoy the full immersive experience.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Show>

                <div class="mt-10 text-center">
                    <a href="/" class="text-sm font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        Back to Website
                    </a>
                </div>
            </div>

            {/* Simple Footer */}
            <div class="mt-8">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 dark:text-zinc-700">
                    Lirld — Identity Discovery App
                </p>
            </div>
        </main>
    );
}
