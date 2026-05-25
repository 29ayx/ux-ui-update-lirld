import type { UserProfileWithOnlineStatus } from "~/lib/users";

export function filterUsers(
  users: UserProfileWithOnlineStatus[] | undefined,
  messagedUserIds: Set<string>
) {
  const available = users?.filter(u => !messagedUserIds.has(u.user_id)) || [];
  const nonHostUsers = available.filter(u => u.isHost !== true);
  
  return {
    available: nonHostUsers,
    online: nonHostUsers.filter(u => u.isOnline).slice(0, 20),
    vip: nonHostUsers.filter(u => u.vip).slice(0, 15),
    recent: nonHostUsers.slice(0, 20),
    allHosts: users?.filter(u => u.isHost === true) || [],
    onlineHosts: (users?.filter(u => u.isHost === true && u.isOnline) || []),
  };
}

export function groupByCountry(users: UserProfileWithOnlineStatus[]) {
  const map = new Map<string, UserProfileWithOnlineStatus[]>();
  const nonHostUsers = users.filter(u => u.isHost !== true);
  nonHostUsers.forEach(u => {
    if (u.country) {
      if (!map.has(u.country)) map.set(u.country, []);
      map.get(u.country)!.push(u);
    }
  });
  return map;
}

export function groupByAge(users: UserProfileWithOnlineStatus[]) {
  const ranges = [
    { label: "18-25", min: 18, max: 25 },
    { label: "26-30", min: 26, max: 30 },
    { label: "31-35", min: 31, max: 35 },
    { label: "36+", min: 36, max: 100 },
  ];
  
  const nonHostUsers = users.filter(u => u.isHost !== true);
  const map = new Map<string, UserProfileWithOnlineStatus[]>();
  ranges.forEach(r => {
    const filtered = nonHostUsers.filter(u => u.age && u.age >= r.min && u.age <= r.max);
    if (filtered.length > 0) map.set(r.label, filtered.slice(0, 15));
  });
  return map;
}

export function groupByGender(users: UserProfileWithOnlineStatus[]) {
  const map = new Map<string, UserProfileWithOnlineStatus[]>();
  const nonHostUsers = users.filter(u => u.isHost !== true);
  nonHostUsers.forEach(u => {
    if (u.gender) {
      if (!map.has(u.gender)) map.set(u.gender, []);
      map.get(u.gender)!.push(u);
    }
  });
  return map;
}
