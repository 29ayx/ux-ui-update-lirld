import { Show, For } from "solid-js";
import AdminLayout from "~/components/admin/AdminLayout";
import { useAdminHosts } from "~/lib/admin";
import { approveHostApplication, rejectHostApplication } from "~/lib/host";
import { useAuth } from "~/lib/auth";
import { HiSolidCheck, HiSolidXMark, HiSolidUser, HiSolidDocumentText } from "solid-icons/hi";

export default function AdminHosts() {
  const { user } = useAuth();
  const { applications, loading, statusFilter, setStatusFilter } = useAdminHosts();

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const handleApprove = async (userId: string) => {
    if (!confirm("Are you sure you want to approve this host application?")) return;
    const currentUser = user();
    if (!currentUser) {
      alert("You must be logged in to perform this action.");
      return;
    }
    try {
      await approveHostApplication(userId, currentUser.uid);
      alert("Host application approved successfully!");
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Failed to approve application. Please try again.");
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;
    const currentUser = user();
    if (!currentUser) {
      alert("You must be logged in to perform this action.");
      return;
    }
    try {
      await rejectHostApplication(userId, currentUser.uid, reason);
      alert("Host application rejected.");
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Failed to reject application. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <AdminLayout>
      <div class="space-y-8">
        {/* Header */}
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200">
          <div>
            <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
              Neural <span class="text-violet-600">Nodes</span>
            </h1>
            <p class="text-lg font-medium text-slate-500">Host Application Uplink</p>
          </div>

          {/* Status Filter */}
          <div class="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <For each={["all", "pending", "approved", "rejected"]}>
              {(filter) => (
                <button
                  onClick={() => setStatusFilter(filter as any)}
                  class={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-200 ${statusFilter() === filter
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    }`}
                >
                  {filter}
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Loading State */}
        <Show when={loading()}>
          <div class="flex flex-col items-center justify-center py-32 space-y-6">
            <div class="relative w-20 h-20">
              <div class="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p class="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Scanning Neural Network...</p>
          </div>
        </Show>

        {/* Applications List */}
        <Show when={!loading()}>
          <div class="space-y-6">
            <div class="text-sm font-bold text-slate-500 uppercase tracking-wide pl-2">
              Detected Signals: {applications().length}
            </div>

            <Show
              when={applications().length > 0}
              fallback={
                <div class="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-[2.5rem] border border-slate-200 border-dashed text-center">
                  <div class="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 text-slate-300">
                    <HiSolidDocumentText class="w-10 h-10" />
                  </div>
                  <h3 class="text-xl font-bold text-slate-900 mb-2">No Signals Detected</h3>
                  <p class="text-slate-500 font-medium text-lg">There are no host applications in this sector.</p>
                </div>
              }
            >
              <div class="grid grid-cols-1 gap-6">
                <For each={applications()}>
                  {(app) => (
                    <div class="group relative bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div class="flex flex-col xl:flex-row gap-10 items-start">
                        {/* User Info */}
                        <div class="flex-1 flex gap-8 items-start w-full">
                          <div class="w-20 h-20 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-sm shrink-0">
                            <HiSolidUser class="w-10 h-10" />
                          </div>
                          <div class="flex-1 min-w-0">
                            <div class="flex flex-wrap items-center gap-4 mb-2">
                              <h3 class="text-2xl font-black text-slate-900 tracking-tight truncate">
                                {app.userName || "Unknown Entity"}
                              </h3>
                              <span class={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                                {app.status}
                              </span>
                            </div>
                            <p class="text-base font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-lg inline-block font-mono">
                              {app.userEmail || "No Comm Link"}
                            </p>

                            <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
                              <div>
                                <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Verification ID</label>
                                <p class="text-base font-bold text-slate-700 font-mono break-all bg-slate-50 p-2 rounded-lg border border-slate-100">{app.verificationId || "N/A"}</p>
                              </div>
                              <div>
                                <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Rate Setting</label>
                                <p class="text-2xl font-black text-emerald-600 flex items-baseline gap-1">
                                  ${app.pricePerMinute || 0}
                                  <span class="text-sm font-bold text-slate-400">/min</span>
                                </p>
                              </div>
                              <div>
                                <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Timestamp</label>
                                <p class="text-base font-bold text-slate-700">{formatDate(app.appliedAt)}</p>
                              </div>
                            </div>

                            <Show when={app.rejectionReason}>
                              <div class="mt-6 p-5 bg-red-50 rounded-2xl border border-red-100 text-red-700 text-sm">
                                <span class="font-black uppercase tracking-wider mr-2">Rejection Loop:</span>
                                <span class="font-medium">{app.rejectionReason}</span>
                              </div>
                            </Show>
                          </div>
                        </div>

                        {/* Actions */}
                        <Show when={app.status === "pending"}>
                          <div class="flex flex-row xl:flex-col gap-4 w-full xl:w-auto shrink-0 pt-2">
                            <button
                              onClick={() => handleApprove(app.userId)}
                              class="flex-1 xl:flex-none px-8 py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0 min-w-[160px]"
                            >
                              <HiSolidCheck class="w-5 h-5" />
                              <span>Authorize</span>
                            </button>
                            <button
                              onClick={() => handleReject(app.userId)}
                              class="flex-1 xl:flex-none px-8 py-4 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border-2 border-slate-200 hover:border-red-200 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 min-w-[160px]"
                            >
                              <HiSolidXMark class="w-5 h-5" />
                              <span>Decline</span>
                            </button>
                          </div>
                        </Show>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </AdminLayout>
  );
}
