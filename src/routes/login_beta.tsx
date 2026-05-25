import { createSignal, createMemo, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import {
    IoArrowForward,
    IoLockClosedOutline,
    IoFlashOutline,
    IoShieldCheckmarkOutline,
    IoLogoGoogle,
    IoChevronDown,
    IoSparkles
} from "solid-icons/io";

import { BsStars } from "solid-icons/bs";

export default function LoginBeta() {
    const [phoneNumber, setPhoneNumber] = createSignal("");

    return (
        <div class="min-h-screen bg-[#02071B] text-white flex flex-col lg:flex-row overflow-hidden font-sans relative" style={{ "background-color": "#02071B" }}>
            {/* Left Side: Hero Section */}
            <div class="relative w-full lg:w-1/2 h-[50vh] lg:h-screen overflow-hidden">
                {/* Background Image with Overlay */}
                <div class="absolute inset-0 z-0">
                    <img
                        src="/assets/login_bg.png"
                        alt="Night sky"
                        class="w-full h-full object-cover"
                        style={{ "object-position": "bottom" }}
                    />
                    <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />

                    {/* Decorative Concentric Circles */}
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square border border-white/5 rounded-full pointer-events-none" />
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square border border-white/5 rounded-full pointer-events-none" />
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square border border-white/5 rounded-full pointer-events-none" />
                </div>

                {/* Content Layer */}
                <div class="relative z-10 h-full flex flex-col p-8 lg:p-16 justify-between">
                    {/* Header */}
                    <div>
                        <div class="max-w-2xl mx-auto flex flex-col gap-1 mb-12">
                            <div class="text-3xl font-black tracking-tighter flex items-center gap-1">
                                Lirld<span class="w-2 h-2 rounded-full bg-indigo-500 mt-3"></span>com
                            </div>
                            <div class="text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase">
                                Always feel connected
                            </div>
                        </div>

                        <div class="max-w-2xl mx-auto text-start lg:mt-30">
                            <h1 class="text-4xl lg:text-7xl font-bold leading-[1.1] mb-8" style={{ "word-spacing": "0.2em" }}>
                                Real connections <br />
                                Starts with <span class="text-indigo-500">real people.</span>
                            </h1>
                            <p class="text-zinc-400 text-lg font-normal leading-relaxed max-w-lg">
                                Discover amazing people, have meaningful conversations, and build memories that last.
                            </p>
                        </div>
                    </div>

                    {/* Footer Social Proof */}
                    <div class="flex items-center gap-4">
                        <div class="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div class="w-10 h-10 rounded-full border-2 border-[#050608] overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?u=${i}`} class="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <div>
                            <div class="text-xl font-black tracking-tight">50K+</div>
                            <div class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">People are already connecting</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div class="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
                {/* Background Image */}
                <div class="absolute inset-0 z-0">
                    <img
                        src="/assets/bg_form.jpeg"
                        alt="Abstract background"
                        class="w-full h-full object-cover"
                    />
                    <div class="absolute inset-0 bg-gradient-to-tr from-[#020619] via-transparent to-[#020619]/80" />
                </div>

                {/* Glow Effects */}
                <div class="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />
                <div class="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

                {/* Decorative Sparkles */}
                <div class="absolute top-[15%] right-[20%] text-white/20 pointer-events-none animate-pulse">
                    <BsStars size={16} />
                </div>
                <div class="absolute top-[25%] right-[15%] text-white/10 pointer-events-none animate-pulse" style={{ "animation-delay": "1s" }}>
                    <IoSparkles size={8} />
                </div>

                <div class="w-full max-w-md z-10">
                    {/* Form Header */}
                    <div class="text-center mb-8">
                        <div class="flex items-center justify-center gap-2 mb-1">
                            <h2 class="text-[32px] font-bold tracking-tight leading-tight text-white/90">Start Connecting</h2>
                            <div class="mt-1">
                                <IoSparkles class="text-purple-400 fill-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" size={16} />
                            </div>
                        </div>
                        <p class="text-zinc-500 font-normal text-sm opacity-80">Meet real people in seconds.</p>
                    </div>

                    {/* Form Content */}
                    <div class="space-y-8">
                        {/* Phone Login */}
                        <div class="w-full">
                            <label class="block text-[13px] font-medium text-zinc-500 mb-2 ml-1">Login with mobile number</label>
                            <div class="group relative flex items-center bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-2xl focus-within:border-purple-500/40 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-500 h-[58px]">
                                <div class="flex items-center gap-1.5 pl-4 pr-3 border-r border-white/10 cursor-pointer hover:bg-white/5 transition-colors h-full">
                                    <span class="text-lg">🇮🇳</span>
                                    <span class="font-semibold text-zinc-300 text-sm">+91</span>
                                    <IoChevronDown size={12} class="text-zinc-600" />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Enter mobile number"
                                    class="flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-normal px-4 placeholder:text-zinc-600/60 text-white"
                                    value={phoneNumber()}
                                    onInput={(e) => setPhoneNumber(e.currentTarget.value)}
                                />
                                <button class="w-10 h-10 flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all active:scale-95 mr-2">
                                    <IoArrowForward size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div class="flex items-center gap-4 text-zinc-600 py-0">
                            <div class="flex-1 h-[1px] bg-white/5"></div>
                            <span class="text-[13px] font-medium text-zinc-500 lowercase">or continue with</span>
                            <div class="flex-1 h-[1px] bg-white/5"></div>
                        </div>

                        {/* Google Login */}
                        <button class="w-full h-[58px] flex items-center justify-between px-4 bg-white hover:bg-zinc-100 text-black rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md group">
                            <div class="flex items-center gap-3">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                                </svg>
                                <span class="text-[15px] font-semibold tracking-tight">Continue with Google</span>
                            </div>
                            <IoArrowForward size={20} class="text-zinc-900" />
                        </button>

                        {/* Features Info */}
                        <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-4">
                            <div class="flex items-center gap-2">
                                <div class="w-5 h-5 flex items-center justify-center rounded-full bg-purple-500/10 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                    <IoLockClosedOutline size={12} />
                                </div>
                                <div class="text-[12px] font-medium text-zinc-500 whitespace-nowrap">No password needed</div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-5 h-5 flex items-center justify-center rounded-full bg-purple-500/10 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                    <IoFlashOutline size={12} />
                                </div>
                                <div class="text-[12px] font-medium text-zinc-500 whitespace-nowrap">Fast sign in, just a tap</div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-5 h-5 flex items-center justify-center rounded-full bg-purple-500/10 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                    <IoShieldCheckmarkOutline size={12} />
                                </div>
                                <div class="text-[12px] font-medium text-zinc-500 whitespace-nowrap">Private & secure</div>
                            </div>
                        </div>
                    </div>


                </div>
                {/* Footer Terms at Bottom of Right Section */}
                <p class="absolute bottom-4 left-0 right-0 text-center text-xs text-zinc-600 font-normal leading-relaxed z-10 px-4 opacity-60">
                    By continuing, you agree to our <br class="lg:hidden" />
                    <A href="/terms" class="text-purple-400/80 hover:text-purple-400 hover:underline transition-colors">Terms of Service</A> and <A href="/privacy" class="text-purple-400/80 hover:text-purple-400 hover:underline transition-colors">Privacy Policy</A>.
                </p>
            </div>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
