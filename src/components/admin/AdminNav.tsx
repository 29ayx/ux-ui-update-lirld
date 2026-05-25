import { createSignal, For, Show } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { IoClose, IoMenu, IoStatsChart, IoPeople, IoShield, IoMegaphone, IoWallet, IoChatbubbles, IoGrid } from "solid-icons/io";

interface NavItem {
  name: string;
  path: string;
  icon: any;
}

const navItems: NavItem[] = [
  { name: "Overview", path: "/admin/overview", icon: (p: any) => <IoStatsChart {...p} class="text-blue-400" /> },
  { name: "Matrix", path: "/admin/matrix", icon: (p: any) => <IoGrid {...p} class="text-green-400 animate-pulse" /> },
  { name: "Users", path: "/admin/users", icon: (p: any) => <IoPeople {...p} class="text-emerald-400" /> },
  { name: "Hosts", path: "/admin/hosts", icon: (p: any) => <IoShield {...p} class="text-orange-400" /> },
  { name: "Chats", path: "/admin/chats", icon: (p: any) => <IoChatbubbles {...p} class="text-pink-400" /> },
  { name: "Plans", path: "/admin/plans", icon: (p: any) => <IoWallet {...p} class="text-amber-400" /> },
  { name: "Marketing", path: "/admin/marketing", icon: (p: any) => <IoMegaphone {...p} class="text-purple-400" /> },
];

export default function AdminNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Mobile menu button */}
      <div class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
              class="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Show when={mobileMenuOpen()} fallback={<IoMenu size={24} />}>
                <IoClose size={24} />
              </Show>
            </button>
            <h1 class="text-base font-black text-slate-900 tracking-tight">Admin Console</h1>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <Show when={mobileMenuOpen()}>
        <div
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      </Show>

      {/* Mobile slide-out drawer */}
      <div
        class={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${mobileMenuOpen() ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <span class="text-white font-black text-lg">L</span>
              </div>
              <h2 class="text-sm font-black text-white uppercase tracking-wider">Admin Console</h2>
            </div>
            <button
              onClick={closeMobileMenu}
              class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <IoClose size={22} />
            </button>
          </div>
          <nav class="flex-1 px-4 py-6 space-y-2">
            <For each={navItems}>
              {(item) => (
                <A
                  href={item.path}
                  onClick={closeMobileMenu}
                  class={`flex items-center px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${isActive(item.path)
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-white/50 hover:bg-white/5 hover:text-white border border-transparent"
                    }`}
                >
                  <item.icon size={20} class="mr-3" />
                  {item.name}
                </A>
              )}
            </For>
          </nav>

          <div class="px-6 py-6 border-t border-white/10">
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span class="text-xs font-bold text-white/60 uppercase tracking-wide">System Online</span>
              </div>
              <p class="text-xs text-white/40 font-medium">
                Production Environment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col z-50">
        <div class="flex flex-col flex-grow bg-[#0f172a] bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#312e81] pt-8 pb-4 overflow-y-auto px-4 border-r border-white/5">
          <div class="flex items-center flex-shrink-0 px-4 mb-10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
                <span class="text-white font-black text-xl italic tracking-tighter">L</span>
              </div>
              <h1 class="text-xl font-black text-white tracking-tighter uppercase italic">Console V2</h1>
            </div>
          </div>
          <nav class="flex-1 space-y-2">
            <For each={navItems}>
              {(item) => (
                <A
                  href={item.path}
                  class={`group flex items-center px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden ${isActive(item.path)
                    ? "text-white bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                    : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                >
                  <Show when={isActive(item.path)}>
                    <div class="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50" />
                    <div class="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-full shadow-[0_0_15px_white]" />
                  </Show>
                  <div class={`mr-4 transition-transform duration-500 ${isActive(item.path) ? "scale-110" : "group-hover:scale-110 opacity-60 group-hover:opacity-100"}`}>
                    <item.icon size={20} />
                  </div>
                  <span class="relative z-10">{item.name}</span>
                </A>
              )}
            </For>
          </nav>

          <div class="mt-auto px-4 py-6">
            <div class="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                <span class="text-[10px] font-bold text-white/40 uppercase tracking-widest">System Online</span>
              </div>
              <p class="text-[10px] text-white/30 font-medium leading-relaxed">
                Production Environment <br />
                Version 3.4.0-build.2025
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for mobile top bar */}
      <div class="h-14 lg:hidden" />
    </>
  );
}
