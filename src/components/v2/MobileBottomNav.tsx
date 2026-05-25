import { useNavigate, useLocation } from "@solidjs/router";
import { IoHome, IoChatbubbles, IoCompass, IoPerson } from "solid-icons/io";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";

export default function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const haptic = useHapticFeedback();

    const navItems = [
        { path: "/v2", icon: IoHome, label: "Home" },
        { path: "/explore-users", icon: IoCompass, label: "Explore" },
        { path: "/chats", icon: IoChatbubbles, label: "Chats" },
        { path: "/profile", icon: IoPerson, label: "Me" },
    ];

    const isActive = (path: string) => location.pathname === path;

    const handleNav = (path: string) => {
        haptic.trigger(40);
        navigate(path);
    };

    return (
        <nav class="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md">
            <div class="bg-black/80 dark:bg-zinc-900/80 backdrop-blur-2xl px-6 py-3 rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex justify-between items-center">
                {navItems.map((item) => (
                    <button
                        onClick={() => handleNav(item.path)}
                        class={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive(item.path)
                                ? "text-pink-500 scale-110"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        <item.icon size={22} class={isActive(item.path) ? "drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" : ""} />
                        <span class="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}
