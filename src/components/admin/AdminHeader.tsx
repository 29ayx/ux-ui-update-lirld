import { createSignal, Show, For } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { useAuth } from "~/lib/auth";
import { IoChevronForward, IoLogOut, IoPerson } from "solid-icons/io";

export default function AdminHeader() {
  const [userMenuOpen, setUserMenuOpen] = createSignal(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Generate breadcrumbs from current path
  const breadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);

    const crumbs = segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { label, href, isLast: index === segments.length - 1 };
    });

    return crumbs;
  };

  return (
    <header class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 transition-all duration-500">
      <div class="px-4 sm:px-6 lg:px-8 py-5">
        <div class="flex items-center justify-between">
          {/* Breadcrumbs */}
          <nav class="flex items-center space-x-3 text-sm font-bold text-slate-500">
            <For each={breadcrumbs()}>
              {(crumb) => (
                <div class="flex items-center">
                  <Show when={!crumb.isLast} fallback={
                    <span class="text-slate-900 font-extrabold">{crumb.label}</span>
                  }>
                    <a
                      href={crumb.href}
                      class="hover:text-blue-600 transition-colors"
                    >
                      {crumb.label}
                    </a>
                    <IoChevronForward size={14} class="mx-3 text-slate-400" />
                  </Show>
                </div>
              )}
            </For>
          </nav>

          {/* User menu */}
          <div class="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen())}
              class="flex items-center space-x-3 px-4 py-2 rounded-2xl text-xs font-bold text-slate-800 bg-white/40 border border-white/60 backdrop-blur-xl shadow-[0_10px_20px_-5px_rgba(0,0,0,0.05)] hover:bg-white/60 transition-all duration-300"
              aria-label="User menu"
            >
              <Show
                when={user()?.photoURL}
                fallback={
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform rotate-3">
                    <IoPerson size={16} class="text-white" />
                  </div>
                }
              >
                <div class="w-8 h-8 rounded-xl overflow-hidden shadow-lg border-2 border-white transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img
                    src={user()!.photoURL!}
                    alt="User avatar"
                    class="w-full h-full object-cover"
                  />
                </div>
              </Show>
              <div class="flex flex-col items-start translate-y-[1px]">
                <span class="hidden sm:inline tracking-tight leading-none mb-0.5">{user()?.displayName || user()?.email?.split('@')[0]}</span>
                <span class="text-[8px] uppercase tracking-widest text-slate-400 font-black">Super Admin</span>
              </div>
            </button>

            {/* Dropdown menu */}
            <Show when={userMenuOpen()}>
              <div
                class="absolute right-0 mt-3 w-56 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-white/60 py-2 z-50 overflow-hidden"
                onClick={() => setUserMenuOpen(false)}
              >
                <button
                  onClick={handleSignOut}
                  class="flex items-center w-full px-5 py-4 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors uppercase tracking-widest"
                >
                  <IoLogOut size={18} class="mr-3" />
                  Terminate Session
                </button>
              </div>
            </Show>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      <Show when={userMenuOpen()}>
        <div
          class="fixed inset-0 z-20"
          onClick={() => setUserMenuOpen(false)}
        />
      </Show>
    </header>
  );
}
