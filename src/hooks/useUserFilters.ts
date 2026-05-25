import { createMemo } from "solid-js";
import type { UserProfileWithOnlineStatus } from "~/lib/users";

// Utility to shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Utility to prioritize by country and gender then shuffle groups
function prioritizedShuffle<T extends { country?: string; gender?: string }>(
  array: T[],
  country?: string,
  preferredGender?: string
): T[] {
  if (!country && !preferredGender) return shuffleArray(array);

  const buckets = {
    localPreferred: [] as T[],
    localSame: [] as T[],
    otherPreferred: [] as T[],
    otherSame: [] as T[]
  };

  array.forEach(u => {
    const isLocal = u.country === country;
    const isPreferred = u.gender === preferredGender;

    if (isLocal) {
      if (isPreferred) buckets.localPreferred.push(u);
      else buckets.localSame.push(u);
    } else {
      if (isPreferred) buckets.otherPreferred.push(u);
      else buckets.otherSame.push(u);
    }
  });

  // Always shuffle each bucket to maintain randomization on refresh
  return [
    ...shuffleArray(buckets.localPreferred),
    ...shuffleArray(buckets.localSame),
    ...shuffleArray(buckets.otherPreferred),
    ...shuffleArray(buckets.otherSame)
  ];
}

export function useUserFilters(
  users: () => UserProfileWithOnlineStatus[] | undefined,
  messagedUserIds: () => Set<string>,
  currentUserCountry?: () => string | undefined,
  currentUserGender?: () => string | undefined
) {
  const preferredGender = createMemo(() => {
    const gender = currentUserGender?.()?.toLowerCase();
    if (gender === 'male') return 'Female';
    if (gender === 'female') return 'Male';
    return undefined;
  });

  const getPrioritized = <T extends { country?: string; gender?: string }>(array: T[]) => {
    return prioritizedShuffle(array, currentUserCountry?.(), preferredGender());
  };
  // 1. Base List (Unshuffled but filtered)
  const filteredBase = createMemo(() => {
    const all = users();
    const messaged = messagedUserIds();
    if (!all) return [];
    return all.filter(user => !messaged.has(user.user_id));
  });

  // 2. Section Memos with Prioritized Randomization
  const availableUsers = createMemo(() => {
    return getPrioritized(filteredBase());
  });

  const onlineUsers = createMemo(() => {
    const filtered = filteredBase().filter(u => u.isOnline);
    return getPrioritized(filtered).slice(0, 20);
  });

  const vipUsers = createMemo(() => {
    const filtered = filteredBase().filter(u => u.vip);
    return getPrioritized(filtered).slice(0, 15);
  });

  const recentUsers = createMemo(() => {
    // Recent stays as is (chronological or fetch order) but follows prioritized base
    return availableUsers().slice(0, 20);
  });

  const recommendedUsers = createMemo(() => {
    return getPrioritized(filteredBase()).slice(0, 20);
  });

  const usersByCountry = createMemo(() => {
    const countryMap = new Map<string, UserProfileWithOnlineStatus[]>();
    filteredBase().forEach(user => {
      if (user.country) {
        if (!countryMap.has(user.country)) {
          countryMap.set(user.country, []);
        }
        countryMap.get(user.country)!.push(user);
      }
    });
    return countryMap;
  });

  const usersByAgeRange = createMemo(() => {
    const ranges = [
      { label: "18-25", min: 18, max: 25 },
      { label: "26-30", min: 26, max: 30 },
      { label: "31-35", min: 31, max: 35 },
      { label: "36+", min: 36, max: 100 },
    ];

    const rangeMap = new Map<string, UserProfileWithOnlineStatus[]>();
    ranges.forEach(range => {
      const usersInRange = filteredBase().filter(u => {
        if (!u.age) return false;
        return u.age >= range.min && u.age <= range.max;
      });
      if (usersInRange.length > 0) {
        rangeMap.set(range.label, getPrioritized(usersInRange).slice(0, 15));
      }
    });
    return rangeMap;
  });

  const usersByGender = createMemo(() => {
    const genderMap = new Map<string, UserProfileWithOnlineStatus[]>();
    filteredBase().forEach(user => {
      if (user.gender) {
        if (!genderMap.has(user.gender)) {
          genderMap.set(user.gender, []);
        }
        genderMap.get(user.gender)!.push(user);
      }
    });

    // Sort gender groups as well
    genderMap.forEach((list, gender) => {
      genderMap.set(gender, getPrioritized(list));
    });

    return genderMap;
  });

  const allHostUsers = createMemo(() => {
    const hosts = (users() || []).filter(u => u.isHost === true);
    return getPrioritized(hosts);
  });

  const onlineHosts = createMemo(() => {
    return allHostUsers().filter(u => u.isOnline);
  });

  return {
    availableUsers,
    onlineUsers,
    vipUsers,
    recentUsers,
    recommendedUsers,
    usersByCountry,
    usersByAgeRange,
    usersByGender,
    allHostUsers,
    onlineHosts,
  };
}
