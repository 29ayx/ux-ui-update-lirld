import { Show, For, createSignal } from "solid-js";
import AdminLayout from "~/components/admin/AdminLayout";
import { useAdminUsers, type AdminUserData } from "~/lib/admin";
import { IoSearch, IoPerson, IoCreate, IoTrash, IoClose } from "solid-icons/io";

export default function AdminUsers() {
  const { users, loading, searchQuery, setSearchQuery } = useAdminUsers();
  const [selectedUser, setSelectedUser] = createSignal<AdminUserData | null>(null);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const isOnline = (lastSeen: any, forcedOnline?: boolean) => {
    if (forcedOnline) return true;
    if (!lastSeen) return false;
    try {
      const date = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
      const now = new Date();
      const diffMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
      return diffMinutes < 5;
    } catch {
      return false;
    }
  };

  return (
    <AdminLayout>
      <div class="flex flex-col gap-6">
        {/* Header */}
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              User <span class="text-blue-600">Management</span>
            </h1>
            <p class="text-sm text-slate-500 font-medium mt-1">Manage all users</p>
          </div>
        </div>

        {/* Search */}
        <div class="relative">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <IoSearch size={20} />
          </div>
          <div class="absolute right-4 top-1/2 -translate-y-1/2">
            <span class="text-xs font-bold text-slate-500">{users().length} users</span>
          </div>
        </div>

        {/* Loading State */}
        <Show when={loading()}>
          <div class="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mx-auto"></div>
            <p class="mt-4 text-sm font-medium text-slate-500">Loading users...</p>
          </div>
        </Show>

        <Show when={!loading()}>
          {/* Mobile Card View */}
          <div class="block lg:hidden space-y-3">
            <For each={users()}>
              {(user) => (
                <div class="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all">
                  <div class="flex items-start gap-3">
                    {/* Avatar */}
                    <div class="relative flex-shrink-0">
                      <div class="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                        <Show when={user.photos?.[0]} fallback={
                          <div class="w-full h-full flex items-center justify-center text-slate-300">
                            <IoPerson size={20} />
                          </div>
                        }>
                          <img src={user.photos![0]} class="w-full h-full object-cover" />
                        </Show>
                      </div>
                      <div class={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${((user as any).forcedOnline || isOnline(user.lastSeen)) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>

                    {/* Info */}
                    <div class="flex-1 min-w-0">
                      <h3 class="text-sm font-bold text-slate-900 truncate">{user.name || "Unknown"}</h3>
                      <p class="text-xs text-slate-500 truncate">{user.email}</p>
                      <div class="flex flex-wrap gap-1.5 mt-2">
                        <Show when={user.isAdmin}>
                          <span class="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold uppercase rounded">Admin</span>
                        </Show>
                        <Show when={user.isHost}>
                          <span class="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold uppercase rounded">Host</span>
                        </Show>
                        <Show when={user.isAI}>
                          <span class="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold uppercase rounded">AI</span>
                        </Show>
                        <span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">{user.country || "Global"}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => setSelectedUser(user)}
                      class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <IoCreate size={16} />
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>

          {/* Desktop Table View */}
          <div class="hidden lg:block overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th class="px-4 py-3">User</th>
                  <th class="px-4 py-3">Email</th>
                  <th class="px-4 py-3">Location</th>
                  <th class="px-4 py-3">Roles</th>
                  <th class="px-4 py-3">Joined</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <For each={users()}>
                  {(user) => (
                    <tr class="bg-white hover:bg-slate-50 transition-colors">
                      <td class="px-4 py-4">
                        <div class="flex items-center gap-3">
                          <div class="relative">
                            <div class="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
                              <Show when={user.photos?.[0]} fallback={
                                <div class="w-full h-full flex items-center justify-center text-slate-300">
                                  <IoPerson size={18} />
                                </div>
                              }>
                                <img src={user.photos![0]} class="w-full h-full object-cover" />
                              </Show>
                            </div>
                            <div class={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${((user as any).forcedOnline || isOnline(user.lastSeen)) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          </div>
                          <span class="text-sm font-bold text-slate-900">{user.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td class="px-4 py-4">
                        <span class="text-sm text-slate-600">{user.email}</span>
                      </td>
                      <td class="px-4 py-4">
                        <span class="text-sm text-slate-600">{user.country || "—"}</span>
                      </td>
                      <td class="px-4 py-4">
                        <div class="flex flex-wrap gap-1.5">
                          <Show when={user.isAdmin}>
                            <span class="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold uppercase rounded">Admin</span>
                          </Show>
                          <Show when={user.isHost}>
                            <span class="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold uppercase rounded">Host</span>
                          </Show>
                          <Show when={user.isAI}>
                            <span class="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold uppercase rounded">AI</span>
                          </Show>
                        </div>
                      </td>
                      <td class="px-4 py-4">
                        <span class="text-sm text-slate-600">{formatDate(user.createdAt)}</span>
                      </td>
                      <td class="px-4 py-4 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          class="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <IoCreate size={16} />
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>

          <Show when={users().length === 0}>
            <div class="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoPerson size={28} class="text-slate-300" />
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-1">No users found</h3>
              <p class="text-sm text-slate-500">Try adjusting your search</p>
            </div>
          </Show>
        </Show>

        {/* User Detail Modal */}
        <Show when={selectedUser()}>
          {(user) => (
            <div
              class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
              onClick={() => setSelectedUser(null)}
            >
              <div
                class="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div class="px-6 py-4 flex items-center justify-between border-b border-slate-200">
                  <h2 class="text-xl font-bold text-slate-900">User Details</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    class="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <IoClose size={20} />
                  </button>
                </div>

                <div class="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div class="flex items-center gap-4">
                    <div class="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden">
                      <Show when={user().photos?.[0]} fallback={
                        <div class="w-full h-full flex items-center justify-center text-slate-300">
                          <IoPerson size={32} />
                        </div>
                      }>
                        <img src={user().photos![0]} class="w-full h-full object-cover" />
                      </Show>
                    </div>
                    <div>
                      <h3 class="text-2xl font-bold text-slate-900">{user().name || "Unknown"}</h3>
                      <p class="text-sm text-slate-500">{user().email}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-slate-50 p-4 rounded-xl">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Country</label>
                      <p class="text-sm font-bold text-slate-900">{user().country || "—"}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-xl">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Gender</label>
                      <p class="text-sm font-bold text-slate-900">{user().gender || "—"}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-xl">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Joined</label>
                      <p class="text-sm font-bold text-slate-900">{formatDate(user().createdAt)}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-xl">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Last Seen</label>
                      <p class="text-sm font-bold text-slate-900">{formatDate(user().lastSeen)}</p>
                    </div>
                  </div>

                  <div class="bg-slate-50 p-4 rounded-xl">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Roles</label>
                    <div class="flex flex-wrap gap-2">
                      <Show when={user().isAdmin}>
                        <span class="px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase rounded-lg">Admin</span>
                      </Show>
                      <Show when={user().isHost}>
                        <span class="px-3 py-1 bg-emerald-500 text-white text-xs font-bold uppercase rounded-lg">Host</span>
                      </Show>
                      <Show when={user().isAI}>
                        <span class="px-3 py-1 bg-purple-600 text-white text-xs font-bold uppercase rounded-lg">AI</span>
                      </Show>
                      <Show when={!user().isAdmin && !user().isHost && !user().isAI}>
                        <span class="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold uppercase rounded-lg">User</span>
                      </Show>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Show>
      </div>
    </AdminLayout>
  );
}
