import { Show, For, createSignal } from "solid-js";
import AdminLayout from "~/components/admin/AdminLayout";
import { useAdminUsers, type AdminUserData, fetchUserActivityStats } from "~/lib/admin";
import { generateFakeUser } from "~/lib/fakeData";
import { db } from "~/lib/firebase";
import { doc, updateDoc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
import UserFormFields from "~/components/admin/UserFormFields";
import { IoSearch, IoPerson, IoCreate, IoTrash } from "solid-icons/io";
import {
  HiSolidPlus,
  HiSolidMapPin,
  HiSolidCalendar,
  HiSolidXMark,
  HiSolidTrash,
  HiSolidEye,
  HiSolidPhone,
  HiSolidChatBubbleBottomCenterText,
  HiSolidCurrencyDollar,
  HiSolidSparkles,
} from "solid-icons/hi";

export default function AdminUsers() {
  const { users, loading, searchQuery, setSearchQuery } = useAdminUsers();
  const [selectedUser, setSelectedUser] = createSignal<AdminUserData | null>(null);
  const [showAddUser, setShowAddUser] = createSignal(false);
  const [showEditUser, setShowEditUser] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [userStats, setUserStats] = createSignal<any>(null);
  const [loadingStats, setLoadingStats] = createSignal(false);

  // Fetch stats when user is selected
  const handleSelectUser = async (user: AdminUserData | null) => {
    setSelectedUser(user);
    if (user) {
      setLoadingStats(true);
      setUserStats(null);
      const stats = await fetchUserActivityStats(user.id);
      setUserStats(stats);
      setLoadingStats(false);
    }
  };

  // Form state — credits is now a number
  const [formData, setFormData] = createSignal({
    name: "",
    email: "",
    country: "",
    language: "",
    gender: "Female",
    isHost: false,
    isAdmin: false,
    pricePerMinute: "0.00",
    credits: 0,
    photoUrl: "",
    photoUrl2: "",
    photos: [] as string[],
    forcedOnline: false,
    isHidden: false,
    isAI: false,
    aiModel: "grok-beta",
    aiPersona: "",
    aiTone: "",
    aiVoiceId: "",
    hidePrice: false,
    age: 18,
    isFeatured: false,
    featuredGif: "",
  });

  const handlePreset = (type: string) => {
    let country = "United States";

    switch (type) {
      case "indian":
        country = "India";
        break;
      case "spanish":
        country = "Spain";
        break;
      case "european":
        const euCountries = ["Germany", "France", "Italy"];
        country = euCountries[Math.floor(Math.random() * euCountries.length)];
        break;
      case "asian":
        const asianCountries = ["Japan", "China"];
        country = asianCountries[Math.floor(Math.random() * asianCountries.length)];
        break;
      case "american":
        country = "United States";
        break;
    }

    const fakeUser = generateFakeUser(country);

    setFormData({
      ...formData(),
      name: fakeUser.name,
      email: fakeUser.email,
      country: fakeUser.country,
      language: fakeUser.language,
    });
  };

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

  const handleAddUser = async (e: Event) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = formData();
      const userId = `user_${Date.now()}`;
      const userData: any = {
        name: data.name,
        email: data.email,
        country: data.country,
        language: data.language,
        gender: data.gender,
        isHost: data.isHost,
        isHidden: data.isHidden,
        isAdmin: data.isAdmin,
        pricePerMinute: data.isHost ? parseFloat(data.pricePerMinute) : 0,
        credits: data.credits,
        createdAt: Timestamp.now(),
        lastSeen: data.forcedOnline
          ? Timestamp.now()
          : Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        forcedOnline: data.forcedOnline,
        profileCompleted: true,
        isAI: data.isAI,
        aiModel: data.isAI ? data.aiModel : null,
        aiPersona: data.isAI ? data.aiPersona : null,
        aiTone: data.isAI ? data.aiTone : null,
        aiVoiceId: data.isAI ? data.aiVoiceId : null,
        hidePrice: data.hidePrice,
        photos: data.photos || [],
        age: data.age,
        isFeatured: data.isFeatured,
        featuredGif: data.featuredGif || "",
      };

      // Legacy support for old photoUrl fields
      if (userData.photos.length === 0) {
        if (data.photoUrl) userData.photos.push(data.photoUrl);
        if (data.photoUrl2) userData.photos.push(data.photoUrl2);
      }

      await setDoc(doc(db, "users", userId), userData);
      setShowAddUser(false);
      setFormData({
        name: "",
        email: "",
        country: "",
        language: "",
        gender: "Female",
        isHost: false,
        isAdmin: false,
        pricePerMinute: "0.00",
        credits: 0,
        photoUrl: "",
        photoUrl2: "",
        photos: [] as string[],
        forcedOnline: false,
        isHidden: false,
        isAI: false,
        aiModel: "grok-beta",
        aiPersona: "",
        aiTone: "",
        aiVoiceId: "",
        hidePrice: false,
        age: 18,
        isFeatured: false,
        featuredGif: "",
      });
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user: " + (error as any).message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async (e: Event) => {
    e.preventDefault();
    const userId = editingUserId();
    if (!userId) return;

    setSaving(true);
    try {
      const data = formData();
      const updateData: any = {
        name: data.name,
        email: data.email,
        country: data.country,
        language: data.language,
        gender: data.gender,
        isHost: data.isHost,
        isAdmin: data.isAdmin,
        isHidden: data.isHidden,
        pricePerMinute: data.isHost ? parseFloat(data.pricePerMinute) : 0,
        credits: data.credits,
        forcedOnline: data.forcedOnline,
        isAI: data.isAI,
        aiModel: data.isAI ? data.aiModel : null,
        aiPersona: data.isAI ? data.aiPersona : null,
        aiTone: data.isAI ? data.aiTone : null,
        aiVoiceId: data.isAI ? data.aiVoiceId : null,
        hidePrice: data.hidePrice,
        photos: data.photos || [],
        age: data.age,
        isFeatured: data.isFeatured,
        featuredGif: data.featuredGif || "",
      };

      if (updateData.photos.length === 0) {
        if (data.photoUrl) updateData.photos.push(data.photoUrl);
        if (data.photoUrl2) updateData.photos.push(data.photoUrl2);
      }

      if (data.forcedOnline) {
        updateData.lastSeen = Timestamp.now();
      }

      await updateDoc(doc(db, "users", userId), updateData);
      setShowEditUser(false);
      setEditingUserId("");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user: " + (error as any).message);
    } finally {
      setSaving(false);
    }
  };

  const [editingUserId, setEditingUserId] = createSignal<string>("");

  const openEditModal = (user: AdminUserData) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      country: user.country || "",
      language: user.language || "",
      gender: user.gender || "Female",
      isHost: user.isHost || false,
      isAdmin: user.isAdmin || false,
      pricePerMinute: (user.pricePerMinute || 0).toFixed(2),
      credits: (user as any).credits ?? 0,
      photoUrl: (user.photos && user.photos[0]) || "",
      photoUrl2: (user.photos && user.photos[1]) || "",
      photos: user.photos || [],
      forcedOnline: (user as any).forcedOnline || false,
      isHidden: user.isHidden || false,
      isAI: user.isAI || false,
      aiModel: user.aiModel || "grok-beta",
      aiPersona: user.aiPersona || "",
      aiTone: user.aiTone || "",
      aiVoiceId: user.aiVoiceId || "",
      hidePrice: user.hidePrice || false,
      age: (user as any).age ?? 18,
      isFeatured: (user as any).isFeatured || false,
      featuredGif: (user as any).featuredGif || "",
    });
    setShowEditUser(true);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setSaving(true);
    try {
      await deleteDoc(doc(db, "users", userId));
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div class="flex flex-col gap-10">
        {/* Header & Title Section */}
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8">
          <div class="flex-1 max-w-2xl lg:translate-y-2">
            <h1 class="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2 md:mb-3 italic">
              User <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Intelligence</span>
            </h1>
            <p class="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.4em] ml-1">Universal Core Management System v2.5</p>
          </div>
          <button
            onClick={() => {
              setFormData({
                name: "",
                email: "",
                photos: [],
                country: "",
                language: "English",
                gender: "Female",
                credits: 0,
                pricePerMinute: "0.00",
                isHost: false,
                isAdmin: false,
                isHidden: false,
                forcedOnline: false,
                isAI: false,
                aiModel: "grok-beta",
                aiPersona: "",
                aiTone: "",
                aiVoiceId: "",
                photoUrl: "",
                photoUrl2: "",
                hidePrice: false,
                age: 18,
                isFeatured: false,
                featuredGif: "",
              });
              setShowAddUser(true);
            }}
            class="group w-full md:w-auto px-6 md:px-10 py-4 md:py-5 bg-slate-900 text-white rounded-2xl md:rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] hover:bg-slate-800 transition-all duration-500 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 md:gap-4 border border-white/10 overflow-hidden relative"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div class="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/10 flex items-center justify-center relative z-10 transition-transform group-hover:rotate-90 duration-500">
              <span class="text-lg md:text-xl font-light mb-0.5">+</span>
            </div>
            <span class="relative z-10">Provision New Entity</span>
          </button>
        </div>

        {/* Search & Intelligence Controls */}
        <div class="p-1.5 md:p-2.5 rounded-2xl md:rounded-[3rem] bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-3 md:gap-4 items-center group/search">
          <div class="relative flex-1 w-full md:translate-x-1">
            <input
              type="text"
              placeholder="Query identities..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl md:rounded-[2.5rem] text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-[12px] focus:ring-blue-500/5 transition-all duration-500"
            />
            <div class="absolute left-4 md:left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-blue-500 transition-all duration-500 group-focus-within/search:scale-110">
              <IoSearch size={20} class="md:hidden" />
              <IoSearch size={24} class="hidden md:block" />
            </div>
          </div>
          <div class="flex items-center gap-3 md:gap-4 px-6 md:px-8 py-4 md:py-0 md:h-[76px] w-full md:w-auto bg-white/80 backdrop-blur-md rounded-xl md:rounded-[2.5rem] border border-white/40 md:mr-1">
            <div class="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <span class="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Indexed</span>
            <span class="text-sm font-black text-slate-900 ml-auto md:ml-2 tracking-tighter">{users().length}</span>
          </div>
        </div>

        {/* Loading State */}
        <Show when={loading()}>
          <div class="text-center py-32 bg-white/20 backdrop-blur-3xl rounded-[3rem] border border-white/60">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
            <p class="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Connecting to Central Information Matrix...</p>
          </div>
        </Show>

        <Show when={!loading()}>
          {/* Data Matrix - Desktop Table */}
          <div class="hidden lg:block overflow-x-auto pb-12 -mx-2 px-2">
            <table class="w-full border-separate border-spacing-y-4">
              <thead>
                <tr class="text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                  <th class="px-10 py-2">Universal Identity</th>
                  <th class="px-6 py-2">Network Endpoint</th>
                  <th class="px-6 py-2 text-center">Biological Matrix</th>
                  <th class="px-6 py-2 text-center">Access Protocols</th>
                  <th class="px-6 py-2 text-center">Initialization</th>
                  <th class="px-10 py-2 text-right">Strategic Actions</th>
                </tr>
              </thead>
              <tbody>
                <For each={users()}>
                  {(user) => (
                    <tr class="group bg-white/70 backdrop-blur-2xl hover:bg-white/90 transition-all duration-700 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-2 relative">
                      <td class="px-10 py-6 rounded-l-[2.5rem] border-y border-l border-white/60 group-hover:border-indigo-200/50 transition-all duration-500">
                        <div class="flex items-center gap-5">
                          <div class="relative">
                            <div class="w-14 h-14 rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden border border-white/60 group-hover:scale-110 group-hover:rotate-2 transition-all duration-700 p-0.5">
                              <div class="w-full h-full rounded-[0.85rem] overflow-hidden">
                                <Show when={user.photos?.[0]} fallback={<div class="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"><IoPerson size={24} /></div>}>
                                  <img src={user.photos![0]} class="w-full h-full object-cover" />
                                </Show>
                              </div>
                            </div>
                            <div class={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-white shadow-lg ${((user as any).forcedOnline || isOnline(user.lastSeen)) ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-slate-200'}`} />
                            <Show when={user.isFeatured}>
                              <div class="absolute -top-2 -left-2 bg-amber-400 text-white p-1 rounded-lg rotate-[-15deg] shadow-lg animate-bounce">
                                <HiSolidSparkles size={12} />
                              </div>
                            </Show>
                          </div>
                          <div class="flex flex-col">
                            <span class="text-base font-black text-slate-800 leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-500 mb-1">
                              {user.name || "UNIDENTIFIED_ENTITY"}
                              <Show when={user.age}><span class="ml-2 text-slate-400 text-xs font-bold">({user.age})</span></Show>
                            </span>
                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full w-fit">UUID: {user.id.slice(0, 12)}</span>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-6 border-y border-white/60 group-hover:border-indigo-200/50 transition-all duration-500">
                        <span class="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors uppercase tracking-tighter">{user.email}</span>
                      </td>
                      <td class="px-6 py-6 border-y border-white/60 group-hover:border-indigo-200/50 text-center transition-all duration-500">
                        <div class="flex flex-col items-center gap-1.5">
                          <span class={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all duration-500 ${user.gender === 'Female' ? 'bg-pink-50 text-pink-500 border-pink-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                            {user.gender || "—"}
                          </span>
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.country || "Intl."}</span>
                        </div>
                      </td>
                      <td class="px-6 py-6 border-y border-white/60 group-hover:border-indigo-200/50 text-center transition-all duration-500">
                        <div class="flex flex-wrap items-center justify-center gap-2">
                          <Show when={user.isAdmin}>
                            <div class="px-3 py-1 bg-slate-900 shadow-xl shadow-slate-900/10 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-xl transform rotate-2">Admin</div>
                          </Show>
                          <Show when={user.isHost}>
                            <div class="px-3 py-1 bg-emerald-500 shadow-xl shadow-emerald-500/10 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-xl transform -rotate-2">Host</div>
                          </Show>
                          <Show when={user.isAI}>
                            <div class="px-3 py-1 bg-purple-600 shadow-xl shadow-purple-600/10 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-xl transform rotate-1">AI</div>
                          </Show>
                          <Show when={!user.isAdmin && !user.isHost && !user.isAI}>
                            <div class="px-3 py-1 bg-white border border-slate-200 text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] rounded-xl">Entity</div>
                          </Show>
                        </div>
                      </td>
                      <td class="px-6 py-6 border-y border-white/60 group-hover:border-indigo-200/50 text-center transition-all duration-500">
                        <span class="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{formatDate(user.createdAt)}</span>
                      </td>
                      <td class="px-10 py-6 rounded-r-[2.5rem] border-y border-r border-white/60 group-hover:border-indigo-200/50 transition-all duration-500 text-right">
                        <div class="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform duration-500">
                          <button
                            onClick={() => handleSelectUser(user)}
                            class="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-500 hover:text-white hover:scale-110 active:scale-90 transition-all duration-500 shadow-lg shadow-transparent hover:shadow-blue-500/20"
                            title="Intelligence Insight"
                          >
                            <HiSolidEye class="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            class="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-800 hover:text-white hover:scale-110 active:scale-90 transition-all duration-500 shadow-lg shadow-transparent hover:shadow-slate-800/20"
                            title="Modify Protocol"
                          >
                            <IoCreate size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name || "User")}
                            class="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white hover:scale-110 active:scale-90 transition-all duration-500 shadow-lg shadow-transparent hover:shadow-red-500/20"
                            title="Terminate Access"
                          >
                            <HiSolidTrash class="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>

          {/* Data Matrix - Mobile/Tablet Cards */}
          <div class="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
            <For each={users()}>
              {(user) => (
                <div class="group bg-white/70 backdrop-blur-2xl p-6 rounded-3xl border border-white/60 shadow-sm hover:shadow-xl transition-all duration-500">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-4">
                      <div class="relative">
                        <div class="w-14 h-14 rounded-2xl bg-white overflow-hidden border border-white/60 p-0.5 shadow-md">
                          <div class="w-full h-full rounded-xl overflow-hidden">
                            <Show when={user.photos?.[0]} fallback={<div class="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"><IoPerson size={24} /></div>}>
                              <img src={user.photos![0]} class="w-full h-full object-cover" />
                            </Show>
                          </div>
                        </div>
                        <div class={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-white shadow-lg ${((user as any).forcedOnline || isOnline(user.lastSeen)) ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-slate-200'}`} />
                        <Show when={user.isFeatured}>
                          <div class="absolute -top-1 -left-1 bg-amber-400 text-white p-1 rounded-lg rotate-[-15deg] shadow-lg">
                            <HiSolidSparkles size={10} />
                          </div>
                        </Show>
                      </div>
                      <div>
                        <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
                          {user.name || "UNIDENTIFIED"}
                          <Show when={user.age}><span class="text-slate-400 text-xs">({user.age})</span></Show>
                        </h3>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">UUID: {user.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div class="flex flex-col gap-2">
                      <button onClick={() => handleSelectUser(user)} class="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100/50"><HiSolidEye size={20} /></button>
                      <button onClick={() => openEditModal(user)} class="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-500 rounded-2xl shadow-sm border border-slate-100"><IoCreate size={20} /></button>
                    </div>
                  </div>

                  <div class="space-y-3 mb-4">
                    <div class="flex items-center justify-between text-[10px]">
                      <span class="font-black text-slate-400 uppercase tracking-wider">Endpoint</span>
                      <span class="font-bold text-slate-600 truncate max-w-[150px]">{user.email}</span>
                    </div>
                    <div class="flex items-center justify-between text-[10px]">
                      <span class="font-black text-slate-400 uppercase tracking-wider">Matrix</span>
                      <span class={`px-2 py-0.5 rounded-full font-black uppercase text-[8px] border ${user.gender === 'Female' ? 'bg-pink-50 text-pink-500 border-pink-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                        {user.gender || "—"} / {user.country || "Intl."}
                      </span>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-2 pt-3 border-t border-slate-100 items-center justify-between">
                    <div class="flex gap-1.5">
                      <Show when={user.isAdmin}><div class="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase tracking-wider rounded-md">Admin</div></Show>
                      <Show when={user.isHost}><div class="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider rounded-md">Host</div></Show>
                      <Show when={user.isAI}><div class="px-2 py-0.5 bg-purple-600 text-white text-[8px] font-black uppercase tracking-wider rounded-md">AI</div></Show>
                    </div>
                    <button
                      onClick={() => { if (confirm("Terminate Entity?")) handleDeleteUser(user.id, user.name || "User") }}
                      class="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <HiSolidTrash size={18} />
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>

          <Show when={users().length === 0}>
            <div class="text-center py-20 bg-white/40 backdrop-blur-md rounded-2xl md:rounded-[2.5rem] border border-white/60 shadow-inner px-6">
              <div class="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <IoPerson size={28} class="text-slate-200 md:hidden" />
                <IoPerson size={32} class="text-slate-200 hidden md:block" />
              </div>
              <h3 class="text-lg font-black text-slate-800 tracking-tighter mb-2">No Identities Detected</h3>
              <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">The matrix is currently devoid of matching record signatures.</p>
            </div>
          </Show>

          <div class="bg-white/40 backdrop-blur-md px-6 md:px-10 py-4 md:py-6 rounded-b-2xl md:rounded-b-[2.5rem] border-t border-white/60 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>System Intelligence Console v2.5</span>
            </div>
            <div class="flex items-center gap-4 md:gap-6">
              <span>Sync: 100%</span>
              <span class="text-slate-900">{users().length} Identified Record{users().length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </Show>

        {/* Selected User Intelligence Modal */}
        <Show when={selectedUser()}>
          {(user) => (
            <div
              class="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-6"
              onClick={() => handleSelectUser(null)}
            >
              <div
                class="bg-white/90 backdrop-blur-3xl rounded-t-[2rem] md:rounded-[3rem] w-full max-w-2xl max-h-[92vh] md:max-h-[90vh] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border border-white flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div class="px-6 md:px-10 py-6 md:py-8 flex items-center justify-between border-b border-white/60 relative overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 pointer-events-none" />
                  <div class="relative z-10">
                    <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tighter italic">Entity <span class="text-blue-600">Intelligence</span></h2>
                    <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Deep Core Analysis Protocol</p>
                  </div>
                  <button
                    onClick={() => handleSelectUser(null)}
                    class="relative z-10 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/80 hover:bg-white rounded-xl md:rounded-2xl shadow-sm border border-white transition-all hover:rotate-90 text-slate-400 hover:text-slate-900"
                  >
                    <HiSolidXMark class="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>

                <div class="p-6 md:p-10 space-y-8 md:space-y-10 overflow-y-auto custom-scrollbar">
                  <div class="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-8 pb-8 md:pb-10 border-b border-slate-100 text-center md:text-left">
                    <div class="relative">
                      <div class="w-24 h-24 md:w-32 md:h-32 rounded-3xl md:rounded-[2.5rem] bg-white p-1 md:p-1.5 shadow-2xl border border-white overflow-hidden transform md:-rotate-3 md:hover:rotate-0 transition-transform duration-500">
                        <Show when={user().photos?.[0]} fallback={<div class="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300"><IoPerson size={32} /></div>}>
                          <img src={user().photos![0]} class="w-full h-full object-cover rounded-[1.4rem] md:rounded-[1.8rem]" />
                        </Show>
                      </div>
                      <div class={`absolute -bottom-2 -right-2 px-3 md:px-4 py-1.5 rounded-full border-[3px] md:border-[4px] border-white shadow-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest ${((user() as any).forcedOnline || isOnline(user().lastSeen)) ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                        {((user() as any).forcedOnline || isOnline(user().lastSeen)) ? 'Active' : 'Standby'}
                      </div>
                    </div>
                    <div class="flex-1 w-full">
                      <h3 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter mb-1">{user().name || "Unknown Identity"}</h3>
                      <p class="text-xs md:text-sm font-bold text-slate-400 lowercase mb-4 truncate max-w-full">{user().email}</p>
                      <div class="flex flex-wrap justify-center md:justify-start gap-2">
                        <span class="px-3 py-1 bg-slate-900 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-xl">UID: {user().id.slice(0, 8)}</span>
                        <span class="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-xl">{user().country || "Global"}</span>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-6">
                    <div class="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-shadow">
                      <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Initialization</label>
                      <p class="text-sm font-black text-slate-800">{formatDate(user().createdAt)}</p>
                    </div>
                    <div class="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-shadow">
                      <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Last Transmission</label>
                      <p class="text-sm font-black text-slate-800">{formatDate(user().lastSeen)}</p>
                    </div>
                    <div class="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-shadow">
                      <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Resource Credits</label>
                      <p class="text-xl font-black text-emerald-600">
                        {((user() as any).credits ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div class="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-shadow">
                      <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Access Tier</label>
                      <div class="flex gap-2">
                        <Show when={user().isAdmin}><span class="w-3 h-3 rounded-full bg-slate-900" title="Admin" /></Show>
                        <Show when={user().isHost}><span class="w-3 h-3 rounded-full bg-emerald-500" title="Host" /></Show>
                        <Show when={user().isAI}><span class="w-3 h-3 rounded-full bg-purple-500" title="AI" /></Show>
                        <Show when={!user().isAdmin && !user().isHost && !user().isAI}><span class="w-3 h-3 rounded-full bg-blue-400" title="Entity" /></Show>
                      </div>
                    </div>
                  </div>

                  {/* Performance Analytics */}
                  <div class="space-y-6 pt-6 mt-6 border-t border-slate-100">
                    <div class="flex items-center justify-between">
                      <h3 class="text-sm font-black text-slate-900 uppercase tracking-[0.2em] italic">Real-Time Performance <span class="text-blue-600">Metrics</span></h3>
                      <div class="flex gap-1">
                        <div class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                        <div class="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      </div>
                    </div>

                    <Show when={!loadingStats()} fallback={<div class="grid grid-cols-2 gap-4"><For each={[1, 2, 3, 4]}>{() => <div class="h-24 bg-slate-50 animate-pulse rounded-[2rem] border border-white" />}</For></div>}>
                      <Show when={userStats()}>
                        {(stats) => (
                          <div class="grid grid-cols-2 gap-4">
                            {/* Stats cards remain unchanged */}
                            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-[2rem] border border-white shadow-sm group/card overflow-hidden relative">
                              <div class="absolute -right-4 -bottom-4 text-blue-100 group-hover:scale-110 transition-transform duration-700">
                                <HiSolidEye class="w-20 h-20" />
                              </div>
                              <div class="relative z-10">
                                <div class="flex items-center gap-2 text-blue-400 mb-2">
                                  <HiSolidEye class="w-4 h-4" />
                                  <span class="text-[9px] font-black uppercase tracking-wider">Visual Exposure</span>
                                </div>
                                <p class="text-3xl font-black text-slate-900 tracking-tighter">{stats().totalViews}</p>
                                <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">{stats().uniqueViewers} Unique Observers</p>
                              </div>
                            </div>

                            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-[2rem] border border-white shadow-sm group/card overflow-hidden relative">
                              <div class="absolute -right-4 -bottom-4 text-emerald-100 group-hover:scale-110 transition-transform duration-700">
                                <HiSolidPhone class="w-20 h-20" />
                              </div>
                              <div class="relative z-10">
                                <div class="flex items-center gap-2 text-emerald-400 mb-2">
                                  <HiSolidPhone class="w-4 h-4" />
                                  <span class="text-[9px] font-black uppercase tracking-wider">Voice Uplink</span>
                                </div>
                                <p class="text-3xl font-black text-slate-900 tracking-tighter">{stats().totalCalls}</p>
                                <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">{stats().totalDuration} Minutes Engaged</p>
                              </div>
                            </div>

                            <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-[2rem] border border-white shadow-sm group/card overflow-hidden relative">
                              <div class="absolute -right-4 -bottom-4 text-purple-100 group-hover:scale-110 transition-transform duration-700">
                                <HiSolidChatBubbleBottomCenterText class="w-20 h-20" />
                              </div>
                              <div class="relative z-10">
                                <div class="flex items-center gap-2 text-purple-400 mb-2">
                                  <HiSolidChatBubbleBottomCenterText class="w-4 h-4" />
                                  <span class="text-[9px] font-black uppercase tracking-wider">Neural Mesh</span>
                                </div>
                                <p class="text-3xl font-black text-slate-900 tracking-tighter">
                                  {user().chattedWith?.length || 0}
                                </p>
                                <p class="text-[9px] font-black text-purple-500 uppercase tracking-widest mt-1">Entity Protocols</p>
                              </div>
                            </div>

                            <div class="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-[2rem] border border-white shadow-sm group/card overflow-hidden relative">
                              <div class="absolute -right-4 -bottom-4 text-amber-100 group-hover:scale-110 transition-transform duration-700">
                                <HiSolidCurrencyDollar class="w-20 h-20" />
                              </div>
                              <div class="relative z-10">
                                <div class="flex items-center gap-2 text-amber-500 mb-2">
                                  <HiSolidCurrencyDollar class="w-4 h-4" />
                                  <span class="text-[9px] font-black uppercase tracking-wider">Revenue Stream</span>
                                </div>
                                <div class="flex items-baseline gap-2">
                                  <p class="text-3xl font-black text-slate-900 tracking-tighter font-mono">${stats().totalEarned}</p>
                                  <span class="text-[10px] font-bold text-amber-600/50">/ ${stats().totalSpent}</span>
                                </div>
                                <p class="text-[9px] font-black text-amber-600 uppercase tracking-widest mt-1">Inflow vs Outflow</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Show>
                    </Show>
                  </div>
                </div>

                <div class="p-6 md:p-10 bg-slate-50 border-t border-white/60 flex flex-col md:flex-row gap-3 md:gap-4">
                  <button
                    onClick={() => {
                      handleSelectUser(null);
                      openEditModal(user());
                    }}
                    class="flex-1 px-6 md:px-8 py-4 bg-slate-900 text-white rounded-2xl md:rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-slate-800 transition-all duration-300 shadow-xl hover:-translate-y-1 active:scale-95 border border-white/10"
                  >
                    Modify Entity Protocol
                  </button>
                  <button
                    onClick={() => { if (confirm("Confirm Decommissioning?")) handleDeleteUser(user().id, user().name || "User") }}
                    disabled={saving()}
                    class="flex-1 px-6 md:px-8 py-4 bg-red-50 text-red-600 rounded-2xl md:rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-red-600 hover:text-white transition-all duration-300 hover:-translate-y-1 active:scale-95 border border-red-100 shadow-sm"
                  >
                    {saving() ? "Terminating..." : "Decommission Entity"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Show>

        {/* Add User Modal */}
        <Show when={showAddUser()}>
          <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-6" onClick={() => setShowAddUser(false)}>
            <div class="bg-white/90 backdrop-blur-3xl rounded-t-[2rem] md:rounded-[3rem] w-full max-w-2xl max-h-[92vh] md:max-h-[90vh] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border border-white flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div class="px-6 md:px-10 py-6 md:py-8 flex items-center justify-between border-b border-white/60 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-blue-50/50 pointer-events-none" />
                <div class="relative z-10">
                  <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tighter italic">Provision <span class="text-emerald-600">Entity</span></h2>
                  <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Universal Initialization Protocol</p>
                </div>
                <button onClick={() => setShowAddUser(false)} class="relative z-10 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/80 hover:bg-white rounded-xl md:rounded-2xl shadow-sm border border-white transition-all hover:rotate-90 text-slate-400 hover:text-slate-900">
                  <HiSolidXMark class="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <form onSubmit={handleAddUser} class="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
                <div class="bg-white/60 p-8 rounded-[2.5rem] border border-white shadow-sm">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Neural Preset Generators</label>
                  <div class="flex flex-wrap gap-2.5">
                    <button type="button" onClick={() => handlePreset("indian")} class="px-5 py-2.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-2xl hover:bg-orange-600 hover:text-white transition-all duration-300 text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-orange-200">🇮🇳 Indian</button>
                    <button type="button" onClick={() => handlePreset("spanish")} class="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-300 text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-red-200">🇪🇸 Spanish</button>
                    <button type="button" onClick={() => handlePreset("european")} class="px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-blue-200">🇪🇺 European</button>
                    <button type="button" onClick={() => handlePreset("asian")} class="px-5 py-2.5 bg-pink-50 text-pink-600 border border-pink-100 rounded-2xl hover:bg-pink-600 hover:text-white transition-all duration-300 text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-pink-200">🌏 Asian</button>
                    <button type="button" onClick={() => handlePreset("american")} class="px-5 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all duration-300 text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-indigo-200">🇺🇸 American</button>
                  </div>
                </div>

                <div class="space-y-8">
                  <UserFormFields formData={formData()} setFormData={setFormData} />
                </div>

                <div class="pt-6 flex gap-4">
                  <button
                    type="submit"
                    disabled={saving()}
                    class="flex-1 px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all duration-300 shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                  >
                    {saving() ? "Initializing..." : "Authorize Provisioning"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    class="px-10 py-5 bg-white text-slate-400 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 border border-slate-100 shadow-sm"
                  >
                    Abort
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Show>

        {/* Edit User Modal */}
        <Show when={showEditUser()}>
          <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-6" onClick={() => setShowEditUser(false)}>
            <div class="bg-white/90 backdrop-blur-3xl rounded-t-[2rem] md:rounded-[3rem] w-full max-w-2xl max-h-[92vh] md:max-h-[90vh] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border border-white flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div class="px-6 md:px-10 py-6 md:py-8 flex items-center justify-between border-b border-white/60 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 pointer-events-none" />
                <div class="relative z-10">
                  <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tighter italic">Modify <span class="text-blue-600">Protocol</span></h2>
                  <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Universal Modification Engine</p>
                </div>
                <button onClick={() => setShowEditUser(false)} class="relative z-10 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/80 hover:bg-white rounded-xl md:rounded-2xl shadow-sm border border-white transition-all hover:rotate-90 text-slate-400 hover:text-slate-900">
                  <HiSolidXMark class="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} class="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
                <div class="space-y-8">
                  <UserFormFields formData={formData()} setFormData={setFormData} />
                </div>

                <div class="pt-6 flex gap-4">
                  <button
                    type="submit"
                    disabled={saving()}
                    class="flex-1 px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all duration-300 shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                  >
                    {saving() ? "Processing..." : "Commit Protocol Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditUser(false)}
                    class="px-10 py-5 bg-white text-slate-400 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 border border-slate-100 shadow-sm"
                  >
                    Cancel
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