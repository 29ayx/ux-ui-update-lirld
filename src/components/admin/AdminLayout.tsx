import { Show, createEffect, type JSX } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "~/lib/auth";
import { useAdminAuth } from "~/lib/admin";
import AdminNav from "./AdminNav";
import AdminHeader from "./AdminHeader";

interface AdminLayoutProps {
    children: JSX.Element;
}

export default function AdminLayout(props: AdminLayoutProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isAdmin, loading } = useAdminAuth(user()?.uid);

    // Redirect non-admins to home page
    createEffect(() => {
        if (!loading() && !isAdmin()) {
            navigate("/", { replace: true });
        }
    });

    return (
        <Show when={!loading()} fallback={
            <div class="flex items-center justify-center min-h-screen">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p class="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        }>
            <Show when={isAdmin()}>
                <div class="min-h-screen bg-[#F0F4F8] relative overflow-hidden font-sans selection:bg-blue-500/30">
                    {/* Premium Aurora Background - Darker/Richer for Contrast */}
                    <div class="fixed inset-0 z-0 pointer-events-none">
                        <div class="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-blue-200/40 via-purple-200/40 to-transparent blur-[120px] rounded-full animate-pulse duration-[5s]" />
                        <div class="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-gradient-to-tl from-emerald-200/40 via-teal-200/40 to-transparent blur-[140px] rounded-full" />
                        <div class="absolute top-[30%] right-[30%] w-[40%] h-[40%] bg-pink-300/20 blur-[100px] rounded-full animate-bounce duration-[15s]" />
                    </div>

                    <AdminNav />
                    <div class="lg:pl-72 relative z-10 transition-all duration-500 min-h-screen flex flex-col">
                        <AdminHeader />
                        <main class="flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-12 pb-20">
                            <div class="w-full max-w-[1920px] mx-auto min-h-[calc(100vh-140px)]">
                                {props.children}
                            </div>
                        </main>
                    </div>
                </div>
            </Show>
        </Show>
    );
}
