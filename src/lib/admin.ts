import { createSignal, onMount, onCleanup, createMemo } from "solid-js";
import { db } from "./firebase";
import { doc, getDoc, onSnapshot, collection, query, orderBy, Timestamp, getDocs, limit, collectionGroup } from "firebase/firestore";

/**
 * Admin user interface
 */
export interface AdminUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Hardcoded admin emails as fallback
 */
const ADMIN_EMAILS = ["ashutoshyadav7@gmail.com"];

/**
 * Check if a user has admin privileges
 */
export async function checkAdminStatus(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return false;
    const userData = userDoc.data();
    return userData.isAdmin === true || (userData.email && ADMIN_EMAILS.includes(userData.email));
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Hook for admin authentication with real-time updates
 */
export function useAdminAuth(userId?: string) {
  const [isAdmin, setIsAdmin] = createSignal(false);
  const [loading, setLoading] = createSignal(true);

  onMount(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const adminStatus = userData.isAdmin === true || (userData.email && ADMIN_EMAILS.includes(userData.email));
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to admin status:", error);
      setIsAdmin(false);
      setLoading(false);
    }
    );

    onCleanup(() => unsubscribe());
  });

  return { isAdmin, loading };
}

/**
 * Admin user data interface
 */
export interface AdminUserData {
  id: string;
  name?: string;
  email?: string;
  profileCompleted?: boolean;
  createdAt?: Timestamp;
  lastSeen?: Timestamp;
  isOnline?: boolean;
  forcedOnline?: boolean;
  isHidden?: boolean;
  isHost?: boolean;
  pricePerMinute?: number;
  chattedWith?: string[];
  photos?: string[];
  country?: string;
  language?: string;
  dob?: string;
  isAdmin?: boolean;
  isAI?: boolean;
  aiModel?: string;
  aiPersona?: string;
  aiTone?: string;
  aiVoiceId?: string;
  gender?: string;
  hidePrice?: boolean;
  age?: number;
  isFeatured?: boolean;
  featuredGif?: string;
  photoURL?: string;
}

/**
 * Fetch detailed activity stats for a specific user
 */
export async function fetchUserActivityStats(userId: string) {
  try {
    const viewersRef = collection(db, `profileViews/${userId}/viewers`);
    const viewersSnapshot = await getDocs(viewersRef);
    let totalViews = 0;
    viewersSnapshot.forEach((doc) => { totalViews += doc.data().viewCount || 1; });

    const callLogsRef = collection(db, `callLogs/${userId}/logs`);
    const logsSnapshot = await getDocs(callLogsRef);
    let totalCalls = 0;
    let totalDuration = 0;
    let totalEarned = 0;
    let totalSpent = 0;

    logsSnapshot.forEach((doc) => {
      const data = doc.data();
      totalCalls++;
      totalDuration += data.duration || 0;
      if (data.direction === 'incoming') totalEarned += data.cost || 0;
      else totalSpent += data.cost || 0;
    });

    return {
      totalViews,
      totalCalls,
      totalDuration: Math.round(totalDuration / 60),
      totalEarned: totalEarned.toFixed(2),
      totalSpent: totalSpent.toFixed(2),
      uniqueViewers: viewersSnapshot.size,
    };
  } catch (error) {
    console.error("Error fetching user activity stats:", error);
    return null;
  }
}

/**
 * Hook for fetching all users with real-time updates
 */
export function useAdminUsers() {
  const [users, setUsers] = createSignal<AdminUserData[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal("");

  onMount(() => {
    const usersQuery = collection(db, "users");
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersList: AdminUserData[] = [];
      snapshot.forEach((doc) => { usersList.push({ id: doc.id, ...doc.data() } as AdminUserData); });
      setUsers(usersList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
    );
    onCleanup(() => unsubscribe());
  });

  const filteredUsers = createMemo(() => {
    const query = searchQuery().toLowerCase().trim();
    if (!query) return users();
    return users().filter((user) => {
      const name = user.name?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      return name.includes(query) || email.includes(query);
    });
  });

  return { users: filteredUsers, allUsers: users, loading, searchQuery, setSearchQuery };
}

/**
 * Admin host application interface
 */
export interface AdminHostApplication {
  userId: string;
  userName?: string;
  userEmail?: string;
  verificationId?: string;
  pricePerMinute?: number;
  status: "pending" | "approved" | "rejected";
  appliedAt?: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  rejectionReason?: string;
}

/**
 * Hook for fetching all host applications with real-time updates
 */
export function useAdminHosts() {
  const [applications, setApplications] = createSignal<AdminHostApplication[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [statusFilter, setStatusFilter] = createSignal<string>("all");

  onMount(() => {
    const hostsQuery = query(collection(db, "hostApplications"), orderBy("appliedAt", "desc"));
    const unsubscribe = onSnapshot(hostsQuery, async (snapshot) => {
      const appsList: AdminHostApplication[] = [];
      for (const appDoc of snapshot.docs) {
        const appData = appDoc.data();
        const userId = appDoc.id;
        try {
          const userRef = doc(db, "users", userId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.exists() ? userDoc.data() : {};
          appsList.push({
            userId,
            userName: (userData as any).name,
            userEmail: (userData as any).email,
            verificationId: appData.verificationId,
            pricePerMinute: appData.pricePerMinute,
            status: appData.status || "pending",
            appliedAt: appData.appliedAt,
            reviewedAt: appData.reviewedAt,
            reviewedBy: appData.reviewedBy,
            rejectionReason: appData.rejectionReason,
          });
        } catch (error) {
          appsList.push({
            userId,
            verificationId: appData.verificationId,
            pricePerMinute: appData.pricePerMinute,
            status: appData.status || "pending",
            appliedAt: appData.appliedAt,
          });
        }
      }
      setApplications(appsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching host applications:", error);
      setLoading(false);
    }
    );
    onCleanup(() => unsubscribe());
  });

  const filteredApplications = createMemo(() => {
    const filter = statusFilter();
    if (filter === "all") return applications();
    return applications().filter((app) => app.status === filter);
  });

  return { applications: filteredApplications, allApplications: applications, loading, statusFilter, setStatusFilter };
}

/**
 * Admin statistics interface
 */
export interface AdminStats {
  totalUsers: number;
  totalHosts: number;
  pendingApplications: number;
  totalRevenue: number;
  countriesBreakdown: Record<string, number>;
  languagesBreakdown: Record<string, number>;
  personalityBreakdown: Record<string, number>;
  genderBreakdown: Record<string, number>;
  profileCompletionRate: number;
}

/**
 * Hook for fetching admin statistics with real-time updates
 */
export function useAdminStats() {
  const [stats, setStats] = createSignal<AdminStats>({
    totalUsers: 0,
    totalHosts: 0,
    pendingApplications: 0,
    totalRevenue: 0,
    countriesBreakdown: {},
    languagesBreakdown: {},
    personalityBreakdown: {},
    genderBreakdown: {},
    profileCompletionRate: 0,
  });
  const [loading, setLoading] = createSignal(true);

  onMount(() => {
    const usersQuery = query(collection(db, "users"));
    const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const totalUsers = snapshot.size;
      let totalHosts = 0;
      const countriesBreakdown: Record<string, number> = {};
      const languagesBreakdown: Record<string, number> = {};
      let profileCompletedCount = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isHost === true) totalHosts++;
        if (data.profileCompleted === true) profileCompletedCount++;
        if (data.country) countriesBreakdown[data.country] = (countriesBreakdown[data.country] || 0) + 1;
        if (data.language) languagesBreakdown[data.language] = (languagesBreakdown[data.language] || 0) + 1;
      });
      setStats((prev) => ({
        ...prev,
        totalUsers,
        totalHosts,
        countriesBreakdown,
        languagesBreakdown,
        profileCompletionRate: totalUsers > 0 ? Math.round((profileCompletedCount / totalUsers) * 100) : 0,
      }));
      setLoading(false);
    });

    const hostsQuery = query(collection(db, "hostApplications"));
    const hostsUnsubscribe = onSnapshot(hostsQuery, (snapshot) => {
      let pendingApplications = 0;
      snapshot.forEach((doc) => { if (doc.data().status === "pending") pendingApplications++; });
      setStats((prev) => ({ ...prev, pendingApplications }));
    });

    onCleanup(() => {
      usersUnsubscribe();
      hostsUnsubscribe();
    });
  });

  return { stats, loading };
}

export interface MatrixData {
  totalUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  topViewedUsers: { userId: string; name: string; views: number; photo?: string }[];
  topChatters: { userId: string; name: string; chats: number; photo?: string }[];
  topRevenueUsers: { userId: string; name: string; revenue: number; photo?: string }[];
  registrationsByDay: Record<string, number>;
  revenueByDay: Record<string, number>;
  genderRatio: { male: number; female: number; other: number };
  countriesBreakdown: Record<string, number>;
  ageBreakdown: Record<string, number>;
  totalRevenue: number;
  totalCalls: number;
  totalCallDuration: number;
  verifiedRate: number;
  loading: boolean;
}

/**
 * Advanced analytics for the Matrix Panel
 */
export function useMatrixStats() {
  const [data, setData] = createSignal<MatrixData>({
    totalUsers: 0,
    activeUsers24h: 0,
    activeUsers7d: 0,
    topViewedUsers: [],
    topChatters: [],
    topRevenueUsers: [],
    registrationsByDay: {},
    revenueByDay: {},
    genderRatio: { male: 0, female: 0, other: 0 },
    countriesBreakdown: {},
    ageBreakdown: {},
    totalRevenue: 0,
    totalCalls: 0,
    totalCallDuration: 0,
    verifiedRate: 0,
    loading: true,
  });

  onMount(async () => {
    const usersUnsubscribe = onSnapshot(collection(db, "users"), async (userSnapshot) => {
      console.log(`[useMatrixStats] Users: ${userSnapshot.size}`);
      const usersList: AdminUserData[] = [];
      const genderRatio = { male: 0, female: 0, other: 0 };
      const registrationsByDay: Record<string, number> = {};
      const countriesBreakdown: Record<string, number> = {};
      const ageBreakdown: Record<string, number> = { "18-24": 0, "25-34": 0, "35-44": 0, "45+": 0, "Unknown": 0 };

      let verifiedCount = 0, active24h = 0, active7d = 0;
      const now = Date.now();
      const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      userSnapshot.forEach((doc) => {
        const u = { id: doc.id, ...doc.data() } as AdminUserData;
        usersList.push(u);

        // Gender breakdown
        const g = (u.gender || "other").toLowerCase();
        if (g === "male") genderRatio.male++;
        else if (g === "female") genderRatio.female++;
        else genderRatio.other++;

        if (u.isHost) verifiedCount++;

        // Activity checks
        const lastSeenMillis = u.lastSeen?.toMillis ? u.lastSeen.toMillis() : (u.lastSeen?.seconds ? u.lastSeen.seconds * 1000 : 0);
        if (lastSeenMillis > twentyFourHoursAgo) active24h++;
        if (lastSeenMillis > sevenDaysAgo) active7d++;

        // Demographic: Country
        if (u.country) {
          countriesBreakdown[u.country] = (countriesBreakdown[u.country] || 0) + 1;
        }

        // Demographic: Age
        if (u.age) {
          if (u.age < 25) ageBreakdown["18-24"]++;
          else if (u.age < 35) ageBreakdown["25-34"]++;
          else if (u.age < 45) ageBreakdown["35-44"]++;
          else ageBreakdown["45+"]++;
        } else {
          ageBreakdown["Unknown"]++;
        }

        // Registration Trend
        if (u.createdAt) {
          try {
            const dateObj = u.createdAt.toDate ? u.createdAt.toDate() : (u.createdAt.seconds ? new Date(u.createdAt.seconds * 1000) : null);
            if (dateObj) {
              const dateStr = dateObj.toLocaleDateString();
              registrationsByDay[dateStr] = (registrationsByDay[dateStr] || 0) + 1;
            }
          } catch (e) {
            console.warn(`[useMatrixStats] Invalid date for user ${u.id}`, e);
          }
        }
      });

      setData(prev => ({
        ...prev,
        totalUsers: userSnapshot.size,
        activeUsers24h: active24h,
        activeUsers7d: active7d,
        genderRatio,
        registrationsByDay,
        countriesBreakdown,
        ageBreakdown,
        verifiedRate: userSnapshot.size > 0 ? Math.round((verifiedCount / userSnapshot.size) * 100) : 0,
      }));

      // Top viewed profiles
      try {
        const viewersSnapshot = await getDocs(query(collectionGroup(db, "viewers")));
        const viewCounts: Record<string, number> = {};
        viewersSnapshot.forEach((doc) => {
          const d = doc.data();
          if (d.viewedUserId) viewCounts[d.viewedUserId] = (viewCounts[d.viewedUserId] || 0) + (d.viewCount || 1);
        });
        const topViewed = Object.entries(viewCounts).sort(([, a], [, b]) => b - a).slice(0, 10).map(([userId, views]) => {
          const u = usersList.find(user => user.id === userId);
          return { userId, views, name: u?.name || "Unknown", photo: u?.photos?.[0] || u?.photoURL };
        });
        setData(prev => ({ ...prev, topViewedUsers: topViewed }));
      } catch (e) { console.error("[useMatrixStats] Viewers error:", e); }

      // Top chatters
      try {
        const chatsSnapshot = await getDocs(collection(db, "chats"));
        const chatterCounts: Record<string, number> = {};
        chatsSnapshot.forEach((doc) => {
          (doc.data().participants || []).forEach((pid: string) => {
            chatterCounts[pid] = (chatterCounts[pid] || 0) + 1;
          });
        });
        const topChatters = Object.entries(chatterCounts).sort(([, a], [, b]) => b - a).slice(0, 10).map(([userId, chats]) => {
          const u = usersList.find(user => user.id === userId);
          return { userId, chats, name: u?.name || "Unknown", photo: u?.photos?.[0] || u?.photoURL };
        });
        setData(prev => ({ ...prev, topChatters: topChatters }));
      } catch (e) { console.error("[useMatrixStats] Chats error:", e); }

      // Revenue and Transactions
      try {
        const transSnapshot = await getDocs(collection(db, "transactions"));
        let totalRevenue = 0;
        const revenueByDay: Record<string, number> = {};
        const revenueByUser: Record<string, number> = {};

        transSnapshot.forEach((doc) => {
          const d = doc.data();
          if (d.type === 'debit') { // We track revenue as debits from user credits (spending)
            totalRevenue += d.amount || 0;

            // Revenue by User
            if (d.userId) {
              revenueByUser[d.userId] = (revenueByUser[d.userId] || 0) + (d.amount || 0);
            }

            // Revenue by Day
            if (d.timestamp) {
              const dateObj = d.timestamp.toDate ? d.timestamp.toDate() : (d.timestamp.seconds ? new Date(d.timestamp.seconds * 1000) : null);
              if (dateObj) {
                const dateStr = dateObj.toLocaleDateString();
                revenueByDay[dateStr] = (revenueByDay[dateStr] || 0) + (d.amount || 0);
              }
            }
          }
        });

        const topRevenue = Object.entries(revenueByUser).sort(([, a], [, b]) => b - a).slice(0, 10).map(([userId, amount]) => {
          const u = usersList.find(user => user.id === userId);
          return { userId, revenue: amount, name: u?.name || "Unknown", photo: u?.photos?.[0] || u?.photoURL };
        });

        setData(prev => ({
          ...prev,
          totalRevenue,
          revenueByDay,
          topRevenueUsers: topRevenue
        }));
      } catch (e) { console.error("[useMatrixStats] Revenue error:", e); }

      // Call Volume
      try {
        const callLogsSnapshot = await getDocs(query(collectionGroup(db, "logs")));
        let totalCalls = 0;
        let totalCallDuration = 0;
        callLogsSnapshot.forEach((doc) => {
          const d = doc.data();
          if (d.direction === 'outgoing') { // Count each call once from caller side
            totalCalls++;
            totalCallDuration += d.duration || 0;
          }
        });
        setData(prev => ({ ...prev, totalCalls, totalCallDuration, loading: false }));
      } catch (e) {
        console.error("[useMatrixStats] Calls error:", e);
        setData(prev => ({ ...prev, loading: false }));
      }
    });

    onCleanup(() => usersUnsubscribe());
  });

  return data;
}

