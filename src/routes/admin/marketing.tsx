import { Component, createSignal, createEffect, For } from "solid-js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "~/lib/firebase";
import { useAuth } from "~/lib/auth";
import AdminLayout from "~/components/admin/AdminLayout";

interface MarketingBanner {
    bg_img: string;
    content: string;
    img: string;
    title: string;
    title_color?: string;
    content_color?: string;
    bg_opacity?: number;
    bg_color?: string;
    active?: boolean;
    showPricing?: boolean;
}

const AdminMarketing: Component = () => {
    const { user } = useAuth();
    const [loading, setLoading] = createSignal(true);
    const [saving, setSaving] = createSignal(false);
    const [message, setMessage] = createSignal("");

    const [homeBanner, setHomeBanner] = createSignal<MarketingBanner>({
        bg_img: "",
        content: "",
        img: "",
        title: ""
    });

    const [promotionBanner, setPromotionBanner] = createSignal<MarketingBanner>({
        bg_img: "",
        content: "",
        img: "",
        title: ""
    });

    const [plansBanner, setPlansBanner] = createSignal<MarketingBanner>({
        bg_img: "",
        content: "",
        img: "",
        title: ""
    });

    const [exploreBanner, setExploreBanner] = createSignal<MarketingBanner>({
        bg_img: "",
        content: "",
        img: "",
        title: "",
        showPricing: true
    });

    createEffect(async () => {
        try {
            const homeDoc = await getDoc(doc(db, "marketing", "banner_home"));
            if (homeDoc.exists()) {
                setHomeBanner(homeDoc.data() as MarketingBanner);
            }

            const promoDoc = await getDoc(doc(db, "marketing", "banner_promotion"));
            if (promoDoc.exists()) {
                setPromotionBanner(promoDoc.data() as MarketingBanner);
            }

            const plansDoc = await getDoc(doc(db, "marketing", "plans_banner"));
            if (plansDoc.exists()) {
                setPlansBanner(plansDoc.data() as MarketingBanner);
            }

            const exploreDoc = await getDoc(doc(db, "marketing", "banner_explore"));
            if (exploreDoc.exists()) {
                setExploreBanner(exploreDoc.data() as MarketingBanner);
            }
        } catch (error) {
            console.error("Error fetching banners:", error);
            setMessage("Error loading banners");
        } finally {
            setLoading(false);
        }
    });

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        try {
            await setDoc(doc(db, "marketing", "banner_home"), homeBanner());
            await setDoc(doc(db, "marketing", "banner_promotion"), promotionBanner());
            await setDoc(doc(db, "marketing", "plans_banner"), plansBanner());
            await setDoc(doc(db, "marketing", "banner_explore"), exploreBanner());
            setMessage("Banners saved successfully!");
        } catch (error) {
            console.error("Error saving banners:", error);
            setMessage("Error saving banners");
        } finally {
            setSaving(false);
        }
    };

    const updateHomeBanner = (field: keyof MarketingBanner, value: string | number | boolean) => {
        setHomeBanner(prev => ({ ...prev, [field]: value }));
    };

    const updatePromotionBanner = (field: keyof MarketingBanner, value: string | number | boolean) => {
        setPromotionBanner(prev => ({ ...prev, [field]: value }));
    };

    const updatePlansBanner = (field: keyof MarketingBanner, value: string | number | boolean) => {
        setPlansBanner(prev => ({ ...prev, [field]: value }));
    };

    const updateExploreBanner = (field: keyof MarketingBanner, value: string | number | boolean) => {
        setExploreBanner(prev => ({ ...prev, [field]: value }));
    };

    return (
        <AdminLayout>
            <div class="space-y-10">
                {/* Header Section */}
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/60 pb-8 relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 pointer-events-none" />
                    <div class="relative z-10">
                        <h1 class="text-4xl font-black text-slate-900 tracking-tighter italic">Neural <span class="text-purple-600">Campaigns</span></h1>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Global Signal Propagation System</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving()}
                        class="relative z-10 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center gap-3 group"
                    >
                        {saving() ? (
                            <>
                                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Injecting Signals...</span>
                            </>
                        ) : (
                            <>
                                <span>Commit Signals</span>
                                <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse group-hover:scale-150 transition-transform" />
                            </>
                        )}
                    </button>
                </div>

                {message() && (
                    <div class={`p-4 rounded-2xl border ${message().includes("Error")
                        ? "bg-red-50/50 border-red-200 text-red-600 shadow-lg shadow-red-500/10"
                        : "bg-emerald-50/50 border-emerald-200 text-emerald-600 shadow-lg shadow-emerald-500/10"
                        } backdrop-blur-md flex items-center justify-center font-bold text-sm tracking-wide animate-fade-in-up`}>
                        {message()}
                    </div>
                )}

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Home Banner Section */}
                    <div class="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] border border-white group hover:shadow-[0_20px_50px_-10px_rgba(168,85,247,0.1)] transition-all duration-500">
                        <div class="flex justify-between items-center mb-8">
                            <div>
                                <h2 class="text-xl font-black text-slate-900 italic tracking-tight">Home <span class="text-purple-600">Interface</span></h2>
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Primary Entry Point</p>
                            </div>
                            <button
                                onClick={() => updateHomeBanner("active", !homeBanner().active)}
                                class={`relative w-16 h-8 rounded-full transition-all duration-300 ${homeBanner().active ? "bg-purple-600 shadow-lg shadow-purple-500/30" : "bg-slate-200"
                                    }`}
                            >
                                <span
                                    class={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 flex items-center justify-center ${homeBanner().active ? "translate-x-8" : "translate-x-0"
                                        }`}
                                >
                                    <span class={`w-1.5 h-1.5 rounded-full ${homeBanner().active ? "bg-purple-600 animate-pulse" : "bg-slate-300"}`} />
                                </span>
                            </button>
                        </div>

                        <div class="space-y-6">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Signal Title</label>
                                    <input
                                        type="text"
                                        value={homeBanner().title}
                                        onInput={(e) => updateHomeBanner("title", e.currentTarget.value)}
                                        class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-300"
                                        placeholder="Enter title..."
                                    />
                                </div>
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Signal Payload</label>
                                    <textarea
                                        value={homeBanner().content}
                                        onInput={(e) => updateHomeBanner("content", e.currentTarget.value)}
                                        rows={3}
                                        class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-300 resize-none"
                                        placeholder="Enter content..."
                                    />
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Background Asset</label>
                                        <input
                                            type="text"
                                            value={homeBanner().bg_img}
                                            onInput={(e) => updateHomeBanner("bg_img", e.currentTarget.value)}
                                            class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                            placeholder="URL..."
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Icon Asset</label>
                                        <input
                                            type="text"
                                            value={homeBanner().img}
                                            onInput={(e) => updateHomeBanner("img", e.currentTarget.value)}
                                            class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                            placeholder="URL..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Calibration</label>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Title</label>
                                        <div class="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                                            <input
                                                type="color"
                                                value={homeBanner().title_color || "#ffffff"}
                                                onInput={(e) => updateHomeBanner("title_color", e.currentTarget.value)}
                                                class="w-6 h-6 rounded border-none cursor-pointer"
                                            />
                                            <span class="text-[10px] font-mono text-slate-500">{homeBanner().title_color || "#ffffff"}</span>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Content</label>
                                        <div class="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                                            <input
                                                type="color"
                                                value={homeBanner().content_color || "#cfc4a0"}
                                                onInput={(e) => updateHomeBanner("content_color", e.currentTarget.value)}
                                                class="w-6 h-6 rounded border-none cursor-pointer"
                                            />
                                            <span class="text-[10px] font-mono text-slate-500">{homeBanner().content_color || "#cfc4a0"}</span>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Base</label>
                                        <div class="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                                            <input
                                                type="color"
                                                value={homeBanner().bg_color || "#30303b"}
                                                onInput={(e) => updateHomeBanner("bg_color", e.currentTarget.value)}
                                                class="w-6 h-6 rounded border-none cursor-pointer"
                                            />
                                            <span class="text-[10px] font-mono text-slate-500">{homeBanner().bg_color || "#30303b"}</span>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Alpha ({homeBanner().bg_opacity ?? 0.3})</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={homeBanner().bg_opacity ?? 0.3}
                                            onInput={(e) => updateHomeBanner("bg_opacity", parseFloat(e.currentTarget.value))}
                                            class="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div class="pt-4 border-t border-slate-100">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Holographic Preview</label>
                                <div
                                    class="rounded-[2rem] p-6 shadow-2xl relative overflow-hidden h-40 group-hover:scale-[1.02] transition-transform duration-500"
                                    style={{ "background-color": homeBanner().bg_color || "#30303b" }}
                                >
                                    <div
                                        class="absolute inset-0 z-0 opacity-80"
                                        style={{
                                            "background-image": `url(${homeBanner().bg_img})`,
                                            "background-size": "cover",
                                            "background-position": "center",
                                            "opacity": homeBanner().bg_opacity ?? 0.3
                                        }}
                                    />
                                    {/* Glass Overlay in Preview */}
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-0" />

                                    <div class="relative z-10 flex flex-col gap-2 h-full justify-end">
                                        <div class="flex items-start justify-between gap-4">
                                            <div class="flex-1">
                                                <h2
                                                    class="text-xl font-bold tracking-tight drop-shadow-md"
                                                    style={{ color: homeBanner().title_color || "white" }}
                                                >
                                                    {homeBanner().title || "Title"}
                                                </h2>
                                                <p
                                                    class="text-xs font-medium mt-1 drop-shadow-sm line-clamp-2"
                                                    style={{ color: homeBanner().content_color || "#cfc4a0" }}
                                                >
                                                    {homeBanner().content || "Content"}
                                                </p>
                                            </div>
                                            {homeBanner().img && (
                                                <img src={homeBanner().img} class="w-14 h-14 rounded-2xl object-cover shadow-lg border border-white/20" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Promotion Banner Section */}
                    <div class="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] border border-white group hover:shadow-[0_20px_50px_-10px_rgba(236,72,153,0.1)] transition-all duration-500">
                        <div class="flex justify-between items-center mb-8">
                            <div>
                                <h2 class="text-xl font-black text-slate-900 italic tracking-tight">Promo <span class="text-pink-500">Boost</span></h2>
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Secondary Engagement Vector</p>
                            </div>
                            <button
                                onClick={() => updatePromotionBanner("active", !promotionBanner().active)}
                                class={`relative w-16 h-8 rounded-full transition-all duration-300 ${promotionBanner().active ? "bg-pink-500 shadow-lg shadow-pink-500/30" : "bg-slate-200"
                                    }`}
                            >
                                <span
                                    class={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 flex items-center justify-center ${promotionBanner().active ? "translate-x-8" : "translate-x-0"
                                        }`}
                                >
                                    <span class={`w-1.5 h-1.5 rounded-full ${promotionBanner().active ? "bg-pink-500 animate-pulse" : "bg-slate-300"}`} />
                                </span>
                            </button>
                        </div>

                        <div class="space-y-6">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Signal Title</label>
                                    <input
                                        type="text"
                                        value={promotionBanner().title}
                                        onInput={(e) => updatePromotionBanner("title", e.currentTarget.value)}
                                        class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder:text-slate-300"
                                    />
                                </div>
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Signal Payload</label>
                                    <textarea
                                        value={promotionBanner().content}
                                        onInput={(e) => updatePromotionBanner("content", e.currentTarget.value)}
                                        rows={3}
                                        class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder:text-slate-300 resize-none"
                                    />
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Background Asset</label>
                                        <input
                                            type="text"
                                            value={promotionBanner().bg_img}
                                            onInput={(e) => updatePromotionBanner("bg_img", e.currentTarget.value)}
                                            class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Icon Asset</label>
                                        <input
                                            type="text"
                                            value={promotionBanner().img}
                                            onInput={(e) => updatePromotionBanner("img", e.currentTarget.value)}
                                            class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Calibration</label>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Title</label>
                                        <div class="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                                            <input type="color" value={promotionBanner().title_color || "#ffffff"} onInput={(e) => updatePromotionBanner("title_color", e.currentTarget.value)} class="w-6 h-6 rounded border-none cursor-pointer" />
                                            <span class="text-[10px] font-mono text-slate-500">{promotionBanner().title_color}</span>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Content</label>
                                        <div class="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                                            <input type="color" value={promotionBanner().content_color || "#cfc4a0"} onInput={(e) => updatePromotionBanner("content_color", e.currentTarget.value)} class="w-6 h-6 rounded border-none cursor-pointer" />
                                            <span class="text-[10px] font-mono text-slate-500">{promotionBanner().content_color}</span>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Base</label>
                                        <div class="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                                            <input type="color" value={promotionBanner().bg_color || "#30303b"} onInput={(e) => updatePromotionBanner("bg_color", e.currentTarget.value)} class="w-6 h-6 rounded border-none cursor-pointer" />
                                            <span class="text-[10px] font-mono text-slate-500">{promotionBanner().bg_color}</span>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Alpha ({promotionBanner().bg_opacity ?? 0.3})</label>
                                        <input type="range" min="0" max="1" step="0.1" value={promotionBanner().bg_opacity ?? 0.3} onInput={(e) => updatePromotionBanner("bg_opacity", parseFloat(e.currentTarget.value))} class="w-full h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                                    </div>
                                </div>
                            </div>

                            <div class="pt-4 border-t border-slate-100">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Holographic Preview</label>
                                <div class="rounded-[2rem] p-6 shadow-2xl relative overflow-hidden h-40 group-hover:scale-[1.02] transition-transform duration-500" style={{ "background-color": promotionBanner().bg_color || "#30303b" }}>
                                    <div class="absolute inset-0 z-0 opacity-80" style={{ "background-image": `url(${promotionBanner().bg_img})`, "background-size": "cover", "background-position": "center", "opacity": promotionBanner().bg_opacity ?? 0.3 }} />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-0" />
                                    <div class="relative z-10 flex flex-col gap-2 h-full justify-end">
                                        <div class="flex items-start justify-between gap-4">
                                            <div class="flex-1">
                                                <h2 class="text-xl font-bold tracking-tight drop-shadow-md" style={{ color: promotionBanner().title_color || "white" }}>{promotionBanner().title || "Title"}</h2>
                                                <p class="text-xs font-medium mt-1 drop-shadow-sm line-clamp-2" style={{ color: promotionBanner().content_color || "#cfc4a0" }}>{promotionBanner().content || "Content"}</p>
                                            </div>
                                            {promotionBanner().img && <img src={promotionBanner().img} class="w-14 h-14 rounded-2xl object-cover shadow-lg border border-white/20" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plans Banner Section */}
                    <div class="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] border border-white group hover:shadow-[0_20px_50px_-10px_rgba(34,197,94,0.1)] transition-all duration-500">
                        <div class="flex justify-between items-center mb-8">
                            <div>
                                <h2 class="text-xl font-black text-slate-900 italic tracking-tight">Econ <span class="text-emerald-500">Matrix</span></h2>
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Financial Incentive Layer</p>
                            </div>
                            <button
                                onClick={() => updatePlansBanner("active", !plansBanner().active)}
                                class={`relative w-16 h-8 rounded-full transition-all duration-300 ${plansBanner().active ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-slate-200"
                                    }`}
                            >
                                <span
                                    class={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 flex items-center justify-center ${plansBanner().active ? "translate-x-8" : "translate-x-0"
                                        }`}
                                >
                                    <span class={`w-1.5 h-1.5 rounded-full ${plansBanner().active ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                                </span>
                            </button>
                        </div>

                        <div class="space-y-6">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Signal Title</label>
                                    <input
                                        type="text"
                                        value={plansBanner().title}
                                        onInput={(e) => updatePlansBanner("title", e.currentTarget.value)}
                                        class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                                    />
                                </div>
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Signal Payload</label>
                                    <textarea
                                        value={plansBanner().content}
                                        onInput={(e) => updatePlansBanner("content", e.currentTarget.value)}
                                        rows={3}
                                        class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300 resize-none"
                                    />
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Background Asset</label>
                                        <input
                                            type="text"
                                            value={plansBanner().bg_img}
                                            onInput={(e) => updatePlansBanner("bg_img", e.currentTarget.value)}
                                            class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Icon Asset</label>
                                        <input
                                            type="text"
                                            value={plansBanner().img}
                                            onInput={(e) => updatePlansBanner("img", e.currentTarget.value)}
                                            class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Calibration</label>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Title</label>
                                        <div class="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                                            <input type="color" value={plansBanner().title_color || "#ffffff"} onInput={(e) => updatePlansBanner("title_color", e.currentTarget.value)} class="w-6 h-6 rounded border-none cursor-pointer" />
                                            <span class="text-[10px] font-mono text-slate-500">{plansBanner().title_color}</span>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Content</label>
                                        <div class="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                                            <input type="color" value={plansBanner().content_color || "#cfc4a0"} onInput={(e) => updatePlansBanner("content_color", e.currentTarget.value)} class="w-6 h-6 rounded border-none cursor-pointer" />
                                            <span class="text-[10px] font-mono text-slate-500">{plansBanner().content_color}</span>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Base</label>
                                        <div class="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                                            <input type="color" value={plansBanner().bg_color || "#30303b"} onInput={(e) => updatePlansBanner("bg_color", e.currentTarget.value)} class="w-6 h-6 rounded border-none cursor-pointer" />
                                            <span class="text-[10px] font-mono text-slate-500">{plansBanner().bg_color}</span>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Alpha ({plansBanner().bg_opacity ?? 0.3})</label>
                                        <input type="range" min="0" max="1" step="0.1" value={plansBanner().bg_opacity ?? 0.3} onInput={(e) => updatePlansBanner("bg_opacity", parseFloat(e.currentTarget.value))} class="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                    </div>
                                </div>
                            </div>

                            <div class="pt-4 border-t border-slate-100">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Holographic Preview</label>
                                <div class="rounded-[2rem] p-6 shadow-2xl relative overflow-hidden h-40 group-hover:scale-[1.02] transition-transform duration-500" style={{ "background-color": plansBanner().bg_color || "#30303b" }}>
                                    <div class="absolute inset-0 z-0 opacity-80" style={{ "background-image": `url(${plansBanner().bg_img})`, "background-size": "cover", "background-position": "center", "opacity": plansBanner().bg_opacity ?? 0.3 }} />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-0" />
                                    <div class="relative z-10 flex flex-col gap-2 h-full justify-end">
                                        <div class="flex items-start justify-between gap-4">
                                            <div class="flex-1">
                                                <h2 class="text-xl font-bold tracking-tight drop-shadow-md" style={{ color: plansBanner().title_color || "white" }}>{plansBanner().title || "Title"}</h2>
                                                <p class="text-xs font-medium mt-1 drop-shadow-sm line-clamp-2" style={{ color: plansBanner().content_color || "#cfc4a0" }}>{plansBanner().content || "Content"}</p>
                                            </div>
                                            {plansBanner().img && <img src={plansBanner().img} class="w-14 h-14 rounded-2xl object-cover shadow-lg border border-white/20" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Explore Users Banner Section */}
                    <div class="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] border border-white group hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.1)] transition-all duration-500">
                        <div class="flex justify-between items-center mb-8">
                            <div>
                                <h2 class="text-xl font-black text-slate-900 italic tracking-tight">Public <span class="text-blue-500">Mesh</span></h2>
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">External Access Protocol</p>
                            </div>
                            <div class="flex items-center gap-4">
                                <label class="flex items-center gap-2 cursor-pointer group/toggle">
                                    <div class={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${exploreBanner().showPricing !== false ? "bg-blue-500 border-blue-500" : "bg-transparent border-slate-300"}`}>
                                        <input
                                            type="checkbox"
                                            checked={exploreBanner().showPricing !== false}
                                            onChange={(e) => updateExploreBanner("showPricing", e.currentTarget.checked)}
                                            class="hidden"
                                        />
                                        <svg class={`w-3 h-3 text-white ${exploreBanner().showPricing !== false ? "scale-100" : "scale-0"} transition-transform`} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover/toggle:text-blue-500 transition-colors">Show Pricing</span>
                                </label>
                                <button
                                    onClick={() => updateExploreBanner("active", !exploreBanner().active)}
                                    class={`relative w-16 h-8 rounded-full transition-all duration-300 ${exploreBanner().active ? "bg-blue-500 shadow-lg shadow-blue-500/30" : "bg-slate-200"
                                        }`}
                                >
                                    <span
                                        class={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 flex items-center justify-center ${exploreBanner().active ? "translate-x-8" : "translate-x-0"
                                            }`}
                                    >
                                        <span class={`w-1.5 h-1.5 rounded-full ${exploreBanner().active ? "bg-blue-500 animate-pulse" : "bg-slate-300"}`} />
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div class="space-y-6">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Signal Title</label>
                                    <input
                                        type="text"
                                        value={exploreBanner().title}
                                        onInput={(e) => updateExploreBanner("title", e.currentTarget.value)}
                                        class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                                    />
                                </div>
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Signal Payload</label>
                                    <textarea
                                        value={exploreBanner().content}
                                        onInput={(e) => updateExploreBanner("content", e.currentTarget.value)}
                                        rows={3}
                                        class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 resize-none"
                                    />
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Background Asset</label>
                                        <input
                                            type="text"
                                            value={exploreBanner().bg_img}
                                            onInput={(e) => updateExploreBanner("bg_img", e.currentTarget.value)}
                                            class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Icon Asset</label>
                                        <input
                                            type="text"
                                            value={exploreBanner().img}
                                            onInput={(e) => updateExploreBanner("img", e.currentTarget.value)}
                                            class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Calibration</label>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Title</label>
                                        <div class="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                                            <input type="color" value={exploreBanner().title_color || "#ffffff"} onInput={(e) => updateExploreBanner("title_color", e.currentTarget.value)} class="w-6 h-6 rounded border-none cursor-pointer" />
                                            <span class="text-[10px] font-mono text-slate-500">{exploreBanner().title_color}</span>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Content</label>
                                        <div class="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                                            <input type="color" value={exploreBanner().content_color || "#cfc4a0"} onInput={(e) => updateExploreBanner("content_color", e.currentTarget.value)} class="w-6 h-6 rounded border-none cursor-pointer" />
                                            <span class="text-[10px] font-mono text-slate-500">{exploreBanner().content_color}</span>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Base</label>
                                        <div class="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                                            <input type="color" value={exploreBanner().bg_color || "#30303b"} onInput={(e) => updateExploreBanner("bg_color", e.currentTarget.value)} class="w-6 h-6 rounded border-none cursor-pointer" />
                                            <span class="text-[10px] font-mono text-slate-500">{exploreBanner().bg_color}</span>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[9px] font-bold text-slate-400">Alpha ({exploreBanner().bg_opacity ?? 0.3})</label>
                                        <input type="range" min="0" max="1" step="0.1" value={exploreBanner().bg_opacity ?? 0.3} onInput={(e) => updateExploreBanner("bg_opacity", parseFloat(e.currentTarget.value))} class="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                    </div>
                                </div>
                            </div>

                            <div class="pt-4 border-t border-slate-100">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Holographic Preview</label>
                                <div class="rounded-[2rem] p-6 shadow-2xl relative overflow-hidden h-40 group-hover:scale-[1.02] transition-transform duration-500" style={{ "background-color": exploreBanner().bg_color || "#30303b" }}>
                                    <div class="absolute inset-0 z-0 opacity-80" style={{ "background-image": `url(${exploreBanner().bg_img})`, "background-size": "cover", "background-position": "center", "opacity": exploreBanner().bg_opacity ?? 0.3 }} />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-0" />
                                    <div class="relative z-10 flex flex-col gap-2 h-full justify-end">
                                        <div class="flex items-start justify-between gap-4">
                                            <div class="flex-1">
                                                <h2 class="text-xl font-bold tracking-tight drop-shadow-md" style={{ color: exploreBanner().title_color || "white" }}>{exploreBanner().title || "Title"}</h2>
                                                <p class="text-xs font-medium mt-1 drop-shadow-sm line-clamp-2" style={{ color: exploreBanner().content_color || "#cfc4a0" }}>{exploreBanner().content || "Content"}</p>
                                            </div>
                                            {exploreBanner().img && <img src={exploreBanner().img} class="w-14 h-14 rounded-2xl object-cover shadow-lg border border-white/20" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMarketing;
