import { Show, For, createMemo } from "solid-js";
import { A } from "@solidjs/router";
import AdminLayout from "~/components/admin/AdminLayout";
import { useAdminStats } from "~/lib/admin";
import { HiSolidUserGroup, HiSolidPhone, HiSolidClock, HiSolidCurrencyDollar } from "solid-icons/hi";
import { IoChevronForward } from "solid-icons/io";

export default function AdminOverview() {
  const { stats, loading } = useAdminStats();

  const topCountries = createMemo(() => {
    const countries = stats().countriesBreakdown;
    return Object.entries(countries)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  });

  const topLanguages = createMemo(() => {
    const languages = stats().languagesBreakdown;
    return Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  });

  return (
    <AdminLayout>
      <div class="flex flex-col gap-6">
        {/* Header */}
        <div class="flex flex-col gap-3">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Admin <span class="text-blue-600">Overview</span>
          </h1>
          <p class="text-sm text-slate-500 font-medium">Management Dashboard</p>
        </div>

        {/* Stats Grid */}
        <Show
          when={!loading()}
          fallback={
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(() => (
                <div class="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          }
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <A
              href="/admin/users"
              class="group bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <HiSolidUserGroup class="w-5 h-5" />
                </div>
                <IoChevronForward class="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Total Users</p>
              <p class="text-3xl font-black text-slate-900">{stats().totalUsers}</p>
            </A>

            {/* Total Hosts */}
            <A
              href="/admin/hosts?filter=approved"
              class="group bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <HiSolidPhone class="w-5 h-5" />
                </div>
                <IoChevronForward class="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Active Hosts</p>
              <p class="text-3xl font-black text-slate-900">{stats().totalHosts}</p>
            </A>

            {/* Pending Applications */}
            <A
              href="/admin/hosts?filter=pending"
              class="group bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <HiSolidClock class="w-5 h-5" />
                </div>
                <IoChevronForward class="text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Pending</p>
              <p class="text-3xl font-black text-slate-900">{stats().pendingApplications}</p>
            </A>

            {/* Total Revenue */}
            <div class="group bg-slate-900 rounded-2xl p-5 border border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div class="flex items-start justify-between mb-3">
                <div class="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                  <HiSolidCurrencyDollar class="w-5 h-5" />
                </div>
              </div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Revenue</p>
              <p class="text-3xl font-black text-white">${stats().totalRevenue}</p>
            </div>
          </div>
        </Show>

        {/* Demographics */}
        <Show when={!loading()}>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Countries */}
            <div class="bg-white rounded-2xl p-5 border border-slate-200">
              <h2 class="text-lg font-bold text-slate-900 mb-4">Top Countries</h2>
              <Show
                when={topCountries().length > 0}
                fallback={<p class="text-sm text-slate-400 py-4">No data</p>}
              >
                <div class="space-y-3">
                  <For each={topCountries()}>
                    {([country, count]) => {
                      const percentage = stats().totalUsers > 0
                        ? Math.round((count / stats().totalUsers) * 100)
                        : 0;
                      return (
                        <div>
                          <div class="flex items-center justify-between mb-1.5 text-sm">
                            <span class="font-bold text-slate-700">{country}</span>
                            <div class="flex items-center gap-2">
                              <span class="font-black text-slate-900">{count}</span>
                              <span class="text-xs font-bold text-slate-500">{percentage}%</span>
                            </div>
                          </div>
                          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              class="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000"
                              style={`width: ${percentage}%`}
                            />
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </div>

            {/* Top Languages */}
            <div class="bg-white rounded-2xl p-5 border border-slate-200">
              <h2 class="text-lg font-bold text-slate-900 mb-4">Top Languages</h2>
              <Show
                when={topLanguages().length > 0}
                fallback={<p class="text-sm text-slate-400 py-4">No data</p>}
              >
                <div class="space-y-3">
                  <For each={topLanguages()}>
                    {([language, count]) => {
                      const percentage = stats().totalUsers > 0
                        ? Math.round((count / stats().totalUsers) * 100)
                        : 0;
                      return (
                        <div>
                          <div class="flex items-center justify-between mb-1.5 text-sm">
                            <span class="font-bold text-slate-700">{language}</span>
                            <div class="flex items-center gap-2">
                              <span class="font-black text-slate-900">{count}</span>
                              <span class="text-xs font-bold text-slate-500">{percentage}%</span>
                            </div>
                          </div>
                          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              class="bg-gradient-to-r from-purple-500 to-pink-600 h-full rounded-full transition-all duration-1000"
                              style={`width: ${percentage}%`}
                            />
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </div>
          </div>

          {/* Profile Completion */}
          <div class="bg-white rounded-2xl p-5 border border-slate-200">
            <h2 class="text-lg font-bold text-slate-900 mb-4">Profile Completion Rate</h2>
            <div class="flex items-center justify-center py-8">
              <div class="relative inline-flex items-center justify-center">
                <svg class="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="60" stroke="rgba(0,0,0,0.05)" stroke-width="12" fill="none" />
                  <circle
                    cx="80" cy="80" r="60"
                    stroke="url(#gradient)"
                    stroke-width="12"
                    fill="none"
                    stroke-dasharray={`${2 * Math.PI * 60}`}
                    stroke-dashoffset={`${2 * Math.PI * 60 * (1 - stats().profileCompletionRate / 100)}`}
                    class="transition-all duration-[2000ms] ease-out"
                    stroke-linecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-4xl sm:text-5xl font-black text-slate-900">{stats().profileCompletionRate}%</span>
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </AdminLayout>
  );
}
