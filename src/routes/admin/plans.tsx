import { createSignal, For, Show } from "solid-js";
import AdminLayout from "~/components/admin/AdminLayout";
import { usePlans, addPlan, updatePlan, deletePlan, type Plan } from "~/lib/plans";
import { HiSolidPlus, HiSolidPencil, HiSolidTrash, HiSolidXMark, HiSolidCurrencyDollar } from "solid-icons/hi";

export default function AdminPlans() {
    const { plans, loading } = usePlans();
    const [showModal, setShowModal] = createSignal(false);
    const [editingPlan, setEditingPlan] = createSignal<Plan | null>(null);
    const [saving, setSaving] = createSignal(false);

    const [formData, setFormData] = createSignal({
        items: "",
        coins: 0,
        price: 0,
    });

    const openAddModal = () => {
        setEditingPlan(null);
        setFormData({ items: "", coins: 0, price: 0 });
        setShowModal(true);
    };

    const openEditModal = (plan: Plan) => {
        setEditingPlan(plan);
        setFormData({
            items: plan.items,
            coins: plan.coins,
            price: plan.price,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingPlan()) {
                await updatePlan(editingPlan()!.id, formData());
            } else {
                await addPlan(formData());
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error saving plan:", error);
            alert("Failed to save plan");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this plan?")) return;
        try {
            await deletePlan(id);
        } catch (error) {
            console.error("Error deleting plan:", error);
            alert("Failed to delete plan");
        }
    };

    return (
        <AdminLayout>
            <div class="space-y-10">
                {/* Header */}
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/60 pb-8 relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 pointer-events-none" />
                    <div class="relative z-10">
                        <h1 class="text-4xl font-black text-slate-900 tracking-tighter italic">Resource <span class="text-emerald-600">Allocation</span></h1>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Currency Distribution Matrix</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        class="relative z-10 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1 active:scale-95 flex items-center gap-3 group"
                    >
                        <span>Inject New Asset</span>
                        <div class="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform text-slate-900">
                            <HiSolidPlus class="w-4 h-4" />
                        </div>
                    </button>
                </div>

                <Show when={loading()}>
                    <div class="flex flex-col items-center justify-center py-24 space-y-4">
                        <div class="relative w-16 h-16">
                            <div class="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                            <div class="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Ledger...</p>
                    </div>
                </Show>

                <Show when={!loading()}>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <For each={plans()}>
                            {(plan) => (
                                <div class="relative group">
                                    <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div class="relative bg-white/60 backdrop-blur-3xl rounded-[2rem] p-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] border border-white group-hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.1)] transition-all duration-500 hover:-translate-y-1">
                                        <div class="flex justify-between items-start mb-6">
                                            <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                <HiSolidCurrencyDollar class="w-6 h-6" />
                                            </div>
                                            <div class="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg">
                                                ${plan.price}
                                            </div>
                                        </div>

                                        <div class="space-y-2 mb-8">
                                            <h3 class="text-xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">{plan.items}</h3>
                                            <div class="flex items-center gap-2">
                                                <span class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                                                    {plan.coins.toLocaleString()}
                                                </span>
                                                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Credits</span>
                                            </div>
                                        </div>

                                        <div class="flex gap-3 pt-6 border-t border-slate-100">
                                            <button
                                                onClick={() => openEditModal(plan)}
                                                class="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                                            >
                                                <HiSolidPencil class="w-3 h-3" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(plan.id)}
                                                class="flex-1 px-4 py-3 bg-white border border-red-100 text-red-400 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                                            >
                                                <HiSolidTrash class="w-3 h-3" />
                                                Purge
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </For>

                        {/* Empty State / Add New Card */}
                        <button
                            onClick={openAddModal}
                            class="group relative min-h-[300px] flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/30 transition-all duration-300"
                        >
                            <div class="w-16 h-16 rounded-full bg-white shadow-sm group-hover:shadow-md flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-all duration-300 mb-4 group-hover:scale-110">
                                <HiSolidPlus class="w-8 h-8" />
                            </div>
                            <span class="text-sm font-bold text-slate-400 group-hover:text-emerald-600 uppercase tracking-widest transition-colors">Initialize New Asset</span>
                        </button>
                    </div>
                </Show>

                {/* Modal */}
                <Show when={showModal()}>
                    <div
                        class="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
                        onClick={() => setShowModal(false)}
                    >
                        <div
                            class="bg-white/90 backdrop-blur-3xl rounded-[3rem] max-w-lg w-full overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border border-white flex flex-col animate-scale-in"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div class="px-10 py-8 flex items-center justify-between border-b border-white/60 relative overflow-hidden">
                                <div class="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 pointer-events-none" />
                                <div class="relative z-10">
                                    <h2 class="text-2xl font-black text-slate-900 tracking-tighter italic">
                                        {editingPlan() ? "Modify" : "Inject"} <span class="text-emerald-600">Asset</span>
                                    </h2>
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Ledger Update Protocol</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    class="relative z-10 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white rounded-2xl shadow-sm border border-white transition-all hover:rotate-90 text-slate-400 hover:text-slate-900"
                                >
                                    <HiSolidXMark class="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} class="p-10 space-y-8">
                                <div class="space-y-6">
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                            Asset Identifier
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData().items}
                                            onInput={(e) => setFormData({ ...formData(), items: e.currentTarget.value })}
                                            class="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                                            placeholder="e.g. Starter Pack"
                                        />
                                    </div>

                                    <div class="grid grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                Credit Volume
                                            </label>
                                            <div class="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={formData().coins}
                                                    onInput={(e) => setFormData({ ...formData(), coins: parseInt(e.currentTarget.value) || 0 })}
                                                    class="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pl-12"
                                                />
                                                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <HiSolidPlus class="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                Fiat Value
                                            </label>
                                            <div class="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                    value={formData().price}
                                                    onInput={(e) => setFormData({ ...formData(), price: parseFloat(e.currentTarget.value) || 0 })}
                                                    class="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pl-12"
                                                />
                                                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="pt-2 flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={saving()}
                                        class="flex-1 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all duration-300 shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                    >
                                        {saving() ? "Processing..." : editingPlan() ? "Commit Updates" : "Initialize Asset"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        class="px-8 py-4 bg-white text-slate-400 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 border border-slate-100 shadow-sm"
                                    >
                                        Abort
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Show>
            </div>
        </AdminLayout>
    );
}
