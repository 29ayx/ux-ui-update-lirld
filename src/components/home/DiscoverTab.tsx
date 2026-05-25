import { createSignal, createMemo, For, Show, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";
import UserSection from "./UserSection";
import type { UserProfileWithOnlineStatus } from "~/lib/users";

interface DiscoverTabProps {
  vipUsers: UserProfileWithOnlineStatus[];
  onlineUsers: UserProfileWithOnlineStatus[];
  recentUsers: UserProfileWithOnlineStatus[];
  recommendedUsers: UserProfileWithOnlineStatus[];
  availableUsers: UserProfileWithOnlineStatus[];
  onMessageSent: (userId: string) => void;
  messagedUserIds?: Set<string>;
}

type AgeRange = "18-25" | "26-30" | "31-35" | "36+";

const AGE_RANGES: { label: AgeRange; min: number; max: number }[] = [
  { label: "18-25", min: 18, max: 25 },
  { label: "26-30", min: 26, max: 30 },
  { label: "31-35", min: 31, max: 35 },
  { label: "36+", min: 36, max: 120 },
];

function useDropdown() {
  const [open, setOpen] = createSignal(false);
  const [rect, setRect] = createSignal<DOMRect | null>(null);
  const toggle = (e: MouseEvent) => {
    const btn = (e.currentTarget as HTMLElement).closest("[data-filter-btn]") as HTMLElement;
    if (btn) setRect(btn.getBoundingClientRect());
    setOpen(v => !v);
  };
  const close = () => setOpen(false);
  return { open, toggle, close, rect };
}

export default function DiscoverTab(props: DiscoverTabProps) {
  const nearby = useDropdown();
  const gender = useDropdown();
  const region = useDropdown();
  const ageRange = useDropdown();
  const advanced = useDropdown();

  const [nearbyFilter, setNearbyFilter] = createSignal<string | null>(null);
  const [genderFilter, setGenderFilter] = createSignal<string | null>(null);
  const [regionFilter, setRegionFilter] = createSignal<string | null>(null);
  const [ageFilter, setAgeFilter] = createSignal<AgeRange | null>(null);

  const countries = createMemo(() => {
    const set = new Set<string>();
    props.availableUsers.forEach(u => { if (u.country) set.add(u.country); });
    return Array.from(set).sort();
  });

  const filteredUsers = createMemo(() => {
    return props.availableUsers.filter(u => {
      if (nearbyFilter() && u.country !== nearbyFilter()) return false;
      if (genderFilter() && u.gender?.toLowerCase() !== genderFilter()) return false;
      if (regionFilter() && u.country !== regionFilter()) return false;
      if (ageFilter()) {
        const range = AGE_RANGES.find(r => r.label === ageFilter());
        if (range && (u.age == null || u.age < range.min || u.age > range.max)) return false;
      }
      return true;
    });
  });

  const activeCount = createMemo(() =>
    [nearbyFilter(), genderFilter(), regionFilter(), ageFilter()].filter(Boolean).length
  );

  const clearAll = () => {
    setNearbyFilter(null);
    setGenderFilter(null);
    setRegionFilter(null);
    setAgeFilter(null);
    advanced.close();
  };

  const handleOutsideClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("[data-filter-btn]") && !target.closest("[data-dropdown]")) {
      nearby.close(); gender.close(); region.close(); ageRange.close(); advanced.close();
    }
  };

  document.addEventListener("mousedown", handleOutsideClick);
  onCleanup(() => document.removeEventListener("mousedown", handleOutsideClick));

  const dropStyle = (r: DOMRect | null, width = 180, alignRight = false) => {
    if (!r) return "";
    const left = alignRight
      ? Math.max(8, r.right - width)
      : Math.min(r.left, window.innerWidth - width - 8);
    return `position:fixed;top:${r.bottom + 6}px;left:${left}px;width:${width}px;z-index:9999;`;
  };

  // Pill button: inactive = white card, active = indigo filled
  const pill = (active: boolean, label: string, value?: string | null) => (
    `inline-flex items-center gap-1.5 px-3 lg:px-4 h-9 lg:h-10 rounded-full text-[13px] lg:text-sm font-medium
     border transition-all duration-150 cursor-pointer select-none whitespace-nowrap
     ${active
      ? "bg-indigo-500 border-indigo-500 text-white shadow-sm shadow-indigo-200"
      : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"}`
  );

  return (
    <div class="py-2 ">

      {/* ── Filter chips bar ── */}
      <div class="mb-5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-1">

          {/* Nearby */}
          <div data-filter-btn class="shrink-0">
            <button
              class={pill(!!nearbyFilter(), "Nearby", nearbyFilter())}
              onClick={(e) => { e.stopPropagation(); nearby.toggle(e); gender.close(); region.close(); ageRange.close(); advanced.close(); }}
            >
              <svg class="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>{nearbyFilter() ?? "Nearby"}</span>
              <Show when={nearbyFilter()}>
                <span class="ml-0.5 opacity-70 text-xs">▾</span>
              </Show>
              <Show when={!nearbyFilter()}>
                <span class="opacity-40 text-xs">▾</span>
              </Show>
            </button>
          </div>

          {/* Gender */}
          <div data-filter-btn class="shrink-0">
            <button
              class={pill(!!genderFilter(), "Gender", genderFilter())}
              onClick={(e) => { e.stopPropagation(); gender.toggle(e); nearby.close(); region.close(); ageRange.close(); advanced.close(); }}
            >
              <svg class="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="capitalize">{genderFilter() ?? "Gender"}</span>
              <span class="opacity-40 text-xs">▾</span>
            </button>
          </div>

          {/* Region */}
          <div data-filter-btn class="shrink-0">
            <button
              class={pill(!!regionFilter(), "Region", regionFilter())}
              onClick={(e) => { e.stopPropagation(); region.toggle(e); nearby.close(); gender.close(); ageRange.close(); advanced.close(); }}
            >
              <svg class="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
              </svg>
              <span>{regionFilter() ?? "Region"}</span>
              <span class="opacity-40 text-xs">▾</span>
            </button>
          </div>

          {/* Age */}
          <div data-filter-btn class="shrink-0">
            <button
              class={pill(!!ageFilter(), "Age", ageFilter())}
              onClick={(e) => { e.stopPropagation(); ageRange.toggle(e); nearby.close(); gender.close(); region.close(); advanced.close(); }}
            >
              <svg class="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>{ageFilter() ?? "Age range"}</span>
              <span class="opacity-40 text-xs">▾</span>
            </button>
          </div>

          {/* Filters / clear all */}
          <div data-filter-btn class="shrink-0">
            <button
              class={pill(activeCount() > 0, "Filters")}
              onClick={(e) => { e.stopPropagation(); advanced.toggle(e); nearby.close(); gender.close(); region.close(); ageRange.close(); }}
            >
              <svg class="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4-2A1 1 0 018 17v-3.586L3.293 6.707A1 1 0 013 6V4z"/>
              </svg>
              <span>Filters</span>
              <Show when={activeCount() > 0}>
                <span class="bg-white text-indigo-500 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {activeCount()}
                </span>
              </Show>
            </button>
          </div>

          {/* Quick clear — only visible when filters active */}
          <Show when={activeCount() > 0}>
            <div class="shrink-0">
              <button
                class="inline-flex items-center gap-1 px-3 lg:px-4 h-9 lg:h-10 rounded-full text-[13px] lg:text-sm font-medium border border-red-200 text-red-400 bg-red-50 hover:bg-red-100 transition-all duration-150 whitespace-nowrap"
                onClick={clearAll}
              >
                <span>✕</span>
                <span>Clear</span>
              </button>
            </div>
          </Show>
        </div>
      </div>

      {/* ── Portaled dropdowns ── */}

      {/* Nearby */}
      <Show when={nearby.open() && nearby.rect()}>
        <Portal mount={document.body}>
          <div data-dropdown style={dropStyle(nearby.rect(), 190)}
            class="bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 py-1.5 max-h-64 overflow-y-auto">
            <p class="px-4 pt-1 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Country</p>
            <button class={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${!nearbyFilter() ? "text-indigo-500 font-semibold" : "text-slate-600"}`}
              onClick={() => { setNearbyFilter(null); nearby.close(); }}>All countries</button>
            <For each={countries()}>
              {(c) => (
                <button class={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${nearbyFilter() === c ? "text-indigo-500 font-semibold" : "text-slate-600"}`}
                  onClick={() => { setNearbyFilter(c); nearby.close(); }}>{c}</button>
              )}
            </For>
          </div>
        </Portal>
      </Show>

      {/* Gender */}
      <Show when={gender.open() && gender.rect()}>
        <Portal mount={document.body}>
          <div data-dropdown style={dropStyle(gender.rect(), 170)}
            class="bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 py-1.5">
            <p class="px-4 pt-1 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Gender</p>
            {([null, "male", "female", "other"] as (string | null)[]).map(g => (
              <button class={`w-full text-left px-4 py-2 text-sm capitalize transition-colors hover:bg-slate-50 ${genderFilter() === g ? "text-indigo-500 font-semibold" : "text-slate-600"}`}
                onClick={() => { setGenderFilter(g); gender.close(); }}>{g ?? "All genders"}</button>
            ))}
          </div>
        </Portal>
      </Show>

      {/* Region */}
      <Show when={region.open() && region.rect()}>
        <Portal mount={document.body}>
          <div data-dropdown style={dropStyle(region.rect(), 190)}
            class="bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 py-1.5 max-h-64 overflow-y-auto">
            <p class="px-4 pt-1 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Region</p>
            <button class={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${!regionFilter() ? "text-indigo-500 font-semibold" : "text-slate-600"}`}
              onClick={() => { setRegionFilter(null); region.close(); }}>All regions</button>
            <For each={countries()}>
              {(c) => (
                <button class={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${regionFilter() === c ? "text-indigo-500 font-semibold" : "text-slate-600"}`}
                  onClick={() => { setRegionFilter(c); region.close(); }}>{c}</button>
              )}
            </For>
          </div>
        </Portal>
      </Show>

      {/* Age */}
      <Show when={ageRange.open() && ageRange.rect()}>
        <Portal mount={document.body}>
          <div data-dropdown style={dropStyle(ageRange.rect(), 170)}
            class="bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 py-1.5">
            <p class="px-4 pt-1 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Age range</p>
            <button class={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${!ageFilter() ? "text-indigo-500 font-semibold" : "text-slate-600"}`}
              onClick={() => { setAgeFilter(null); ageRange.close(); }}>All ages</button>
            <For each={AGE_RANGES}>
              {(r) => (
                <button class={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${ageFilter() === r.label ? "text-indigo-500 font-semibold" : "text-slate-600"}`}
                  onClick={() => { setAgeFilter(r.label); ageRange.close(); }}>{r.label}</button>
              )}
            </For>
          </div>
        </Portal>
      </Show>

      {/* Advanced panel */}
      <Show when={advanced.open() && advanced.rect()}>
        <Portal mount={document.body}>
          <div data-dropdown style={dropStyle(advanced.rect(), 220, true)}
            class="bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 p-4">
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Active filters</p>
            <Show when={activeCount() === 0}>
              <p class="text-sm text-slate-400 py-1">No filters applied</p>
            </Show>
            <Show when={nearbyFilter()}>
              <div class="flex items-center justify-between py-1.5 border-b border-slate-50">
                <div>
                  <p class="text-[10px] text-slate-400 uppercase tracking-wide">Nearby</p>
                  <p class="text-sm font-medium text-slate-700">{nearbyFilter()}</p>
                </div>
                <button class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors text-xs"
                  onClick={() => setNearbyFilter(null)}>✕</button>
              </div>
            </Show>
            <Show when={genderFilter()}>
              <div class="flex items-center justify-between py-1.5 border-b border-slate-50">
                <div>
                  <p class="text-[10px] text-slate-400 uppercase tracking-wide">Gender</p>
                  <p class="text-sm font-medium text-slate-700 capitalize">{genderFilter()}</p>
                </div>
                <button class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors text-xs"
                  onClick={() => setGenderFilter(null)}>✕</button>
              </div>
            </Show>
            <Show when={regionFilter()}>
              <div class="flex items-center justify-between py-1.5 border-b border-slate-50">
                <div>
                  <p class="text-[10px] text-slate-400 uppercase tracking-wide">Region</p>
                  <p class="text-sm font-medium text-slate-700">{regionFilter()}</p>
                </div>
                <button class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors text-xs"
                  onClick={() => setRegionFilter(null)}>✕</button>
              </div>
            </Show>
            <Show when={ageFilter()}>
              <div class="flex items-center justify-between py-1.5 border-b border-slate-50">
                <div>
                  <p class="text-[10px] text-slate-400 uppercase tracking-wide">Age range</p>
                  <p class="text-sm font-medium text-slate-700">{ageFilter()}</p>
                </div>
                <button class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors text-xs"
                  onClick={() => setAgeFilter(null)}>✕</button>
              </div>
            </Show>
            <Show when={activeCount() > 0}>
              <button class="mt-3 w-full text-sm text-red-400 hover:text-red-500 font-medium bg-red-50 hover:bg-red-100 rounded-xl py-2 transition-colors"
                onClick={clearAll}>Clear all</button>
            </Show>
          </div>
        </Portal>
      </Show>

      <UserSection
        icon="👥"
        title="Find more people"
        users={filteredUsers()}
        countLabel="Active"
        layout="grid"
        onMessageSent={props.onMessageSent}
        messagedUserIds={props.messagedUserIds}
      />
    </div>
  );
}
