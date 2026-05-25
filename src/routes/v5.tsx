import { createMemo, For, Show } from "solid-js";
import { useUserCache } from "~/hooks/useUserCache";
import { UserProfileWithOnlineStatus } from "~/lib/users";
import { IoVideocam, IoChatbubbles, IoHeart, IoSparkles, IoShieldCheckmark } from "solid-icons/io";

export default function MobileFlyerV3() {
    const userCache = useUserCache(() => undefined); // No user ID needed for public flyer

    // Get a selection of users with photos for the background mosaic
    const mosaicUsers = createMemo(() => {
        const users = userCache.users();
        // Shuffle and pick top 24 for a dense mosaic
        return users
            .filter((u: UserProfileWithOnlineStatus) => u.photos && u.photos.length > 0)
            .sort(() => Math.random() - 0.5)
            .slice(0, 24);
    });

    return (
        <div class="relative min-h-svh w-full bg-black overflow-hidden flex flex-col items-center justify-center p-6 select-none touch-none">
            {/* Background Photo Mosaic */}
            <div class="absolute inset-0 z-0 opacity-30 scale-110 rotate-3">
                <div class="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2">
                    <For each={mosaicUsers()}>
                        {(user, i) => (
                            <div
                                class="aspect-[3/4] rounded-lg overflow-hidden bg-zinc-900 animate-in fade-in zoom-in duration-1000"
                                style={{ "animation-delay": `${i() * 80}ms` }}
                            >
                                <img
                                    src={(user.photos && user.photos[0]) || ""}
                                    alt=""
                                    class="w-full h-full object-cover filter brightness-[0.4] grayscale-[40%]"
                                />
                            </div>
                        )}
                    </For>
                </div>
            </div>

            {/* Extreme Vibrant Overlays */}
            <div class="absolute inset-0 z-[1] bg-gradient-to-b from-black/80 via-black/30 to-black/95" />
            <div class="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] z-[1] opacity-60 bg-[radial-gradient(circle,rgba(244,63,94,0.3),transparent_70%)] animate-pulse" />
            <div class="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] z-[1] opacity-60 bg-[radial-gradient(circle,rgba(79,70,229,0.3),transparent_70%)] animate-pulse" style="animation-delay: 2s" />

            {/* Main Content Layer */}
            <div class="relative z-10 w-full flex flex-col items-center text-center">

                {/* Lirld.com Centered Branding */}
                <div class="mb-6 animate-in fade-in zoom-in duration-1000 scale-110">
                    <div class="text-6xl font-black italic tracking-tighter text-white drop-shadow-2xl">
                        Lirld<span class="text-pink-500">.com</span>
                    </div>
                </div>

                {/* Animated Badge */}
                <div class="mb-12 animate-bounce-slow">
                    <div class="px-5 py-2 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center gap-2 shadow-2xl">
                        <div class="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                        <span class="text-[11px] font-black uppercase tracking-[0.25em] text-white">Meet Real Girls Online</span>
                    </div>
                </div>

                {/* Hero Text Section - Aggressive Ad Style */}
                <div class="space-y-6 mb-16">
                    <h1 class="text-7xl sm:text-8xl font-black italic tracking-tighter leading-[0.8] text-white">
                        <span class="block drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform -skew-x-6">TALK TO</span>
                        <span class="block bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 bg-clip-text text-transparent transform -skew-x-6">GIRLS NOW</span>
                    </h1>

                    <div class="space-y-4">
                        <div class="flex flex-col gap-1 items-center">
                            <span class="text-white text-3xl font-black tracking-tighter uppercase italic drop-shadow-lg">100% Free Access</span>
                            <div class="flex items-center gap-3">
                                <span class="px-3 py-1 bg-white text-black text-xs font-black uppercase tracking-widest rounded-sm transform skew-x-12">No Credit Card</span>
                                <span class="px-3 py-1 bg-pink-500 text-white text-xs font-black uppercase tracking-widest rounded-sm transform -skew-x-12">Unlimited Calls</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dynamic Graphic Elements */}

                <div class="relative w-full h-24 mb-12">
                    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
                        <div class="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white rotate-12 animate-float-slow">
                            <IoVideocam size={32} />
                        </div>
                        <div class="w-16 h-16 rounded-3xl bg-pink-500/20 backdrop-blur-xl border border-pink-500/30 flex items-center justify-center text-pink-500 -rotate-12 animate-float-fast">
                            <IoChatbubbles size={32} />
                        </div>
                    </div>
                </div>

                {/* Feature Banner */}
                <div class="w-full py-6 px-4 mb-10 border-y border-white/10 bg-white/5 backdrop-blur-md">
                    <div class="flex justify-around items-center">
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Connect</span>
                            <span class="text-lg font-black text-white italic">INSTANT</span>
                        </div>
                        <div class="w-[1px] h-8 bg-white/10" />
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Privacy</span>
                            <span class="text-lg font-black text-white italic">SECURE</span>
                        </div>
                        <div class="w-[1px] h-8 bg-white/10" />
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Talk</span>
                            <span class="text-lg font-black text-pink-500 italic">24/7 LIVE</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Verification Section */}
                <div class="flex flex-col items-center gap-4">
                    <div class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <IoShieldCheckmark class="text-emerald-500" size={14} />
                        <span class="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">Verified Global Network</span>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }
        @keyframes float-slow {
            0%, 100% { transform: translate(0, 0) rotate(12deg); }
            50% { transform: translate(10px, -20px) rotate(20deg); }
        }
        @keyframes float-fast {
            0%, 100% { transform: translate(0, 0) rotate(-12deg); }
            50% { transform: translate(-10px, -15px) rotate(-5deg); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 5s ease-in-out infinite; }
      `}</style>
        </div>
    );
}
