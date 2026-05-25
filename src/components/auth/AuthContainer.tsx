import { type JSX, onMount, onCleanup } from "solid-js";
import { IoHeart, IoChatbubble, IoEarth, IoVideocam, IoSparkles, IoShieldCheckmark } from "solid-icons/io";

interface AuthContainerProps {
  children: JSX.Element;
  title: string;
  subtitle?: string;
}

export default function AuthContainer(props: AuthContainerProps) {
  let containerRef: HTMLDivElement | undefined;

  // Focus trap for keyboard navigation
  onMount(() => {
    const focusableElements = containerRef?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);
    }

    onCleanup(() => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleKeyDown);
      }
    });
  });

  return (
    <div class="relative min-h-svh w-full bg-[#02071B] text-white overflow-hidden flex flex-col items-center justify-center p-6 lg:p-12 transition-colors duration-500">
      {/* Immersive Floating Elements Layer */}
      <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated Background Glows */}
        <div class="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div class="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s" />

        {/* Floating Creative Particles */}
        <div class="absolute top-[15%] left-[10%] text-blue-500/10 animate-float-slow">
          <IoHeart size={40} />
        </div>
        <div class="absolute top-[65%] left-[15%] text-indigo-500/10 animate-float-medium" style="animation-delay: 1s">
          <IoChatbubble size={30} />
        </div>
        <div class="absolute top-[25%] right-[15%] text-emerald-500/10 animate-float-fast" style="animation-delay: 1.5s">
          <IoVideocam size={35} />
        </div>
        <div class="absolute bottom-[20%] right-[10%] text-indigo-500/10 animate-float-slow" style="animation-delay: 0.5s">
          <IoEarth size={45} />
        </div>
        <div class="absolute top-[45%] right-[5%] text-amber-500/10 dark:text-amber-500/20 animate-bounce-slow">
          <IoSparkles size={25} />
        </div>

        {/* Spotlight Effect */}
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,7,27,0.4)_70%,rgba(2,7,27,0.8)_100%)]" />
      </div>



      {/* Main Content Area */}
      <div class="relative z-10 w-full max-w-lg animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
        <div
          ref={containerRef}
          role="main"
          class="flex flex-col items-center"
        >
          {/* Branded Section */}
          <div class="mb-10 text-center">
            <h1
              id="auth-title"
              class="text-5xl sm:text-6xl font-black mb-4 tracking-tighter text-white drop-shadow-sm"
            >
              {props.title === 'Welcome' ? (
                  <div class="flex items-center justify-center gap-1">
                      Lirld<span class="w-2.5 h-2.5 rounded-full bg-blue-500 mt-4"></span>com
                  </div>
              ) : props.title}
            </h1>
            {props.subtitle && (
              <div class="overflow-hidden">
                <p class="text-xs font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500 animate-in slide-in-from-top-full duration-700">
                  {props.subtitle}
                </p>
              </div>
            )}
          </div>

          {/* Dynamic Content Slot with extra glass effect */}
          <div class="w-full backdrop-blur-sm">
            {props.children}
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-40">
        <div class="flex items-center gap-2 justify-center mb-1">
          <div class="h-[1px] w-4 bg-gray-300 dark:bg-zinc-800" />
          <IoShieldCheckmark class="text-pink-500" size={14} />
          <div class="h-[1px] w-4 bg-gray-300 dark:bg-zinc-800" />
        </div>
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500">
          Military-Grade Encryption
        </p>
      </div>

      <style>{`
        @keyframes float-slow {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(15px, -20px) rotate(5deg); }
            66% { transform: translate(-10px, -10px) rotate(-5deg); }
        }
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-30px); }
        }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
        .animate-float-medium { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-fast { animation: float-slow 5s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
