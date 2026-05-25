import { Show, For, createMemo } from "solid-js";
import AdminLayout from "~/components/admin/AdminLayout";
import { useMatrixStats } from "~/lib/admin";

export default function MatrixPanel() {
    const stats = useMatrixStats();

    const registrationTrend = createMemo(() => {
        const data = stats().registrationsByDay;
        return Object.entries(data)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
    });

    return (
        <AdminLayout>
            <div style={{
                padding: "10px",
                "font-family": "Arial, Helvetica, sans-serif",
                "font-size": "12px",
                background: "#f0f0f0",
                "min-height": "100vh",
                color: "#000"
            }}>
                {/* Title Bar */}
                <div style={{
                    background: "#004080",
                    color: "#fff",
                    padding: "5px 10px",
                    "font-weight": "bold",
                    border: "1px solid #000",
                    "margin-bottom": "10px"
                }}>
                    Admin Matrix Panel - Business Intelligence Dashboard
                </div>

                <Show when={!stats().loading} fallback={<div>Loading dashboard data...</div>}>
                    <div style={{ display: "flex", gap: "10px", "flex-wrap": "wrap" }}>

                        {/* Left Column: Summary and Demographics */}
                        <div style={{ "flex-basis": "250px", "flex-grow": 0 }}>
                            <table style={{ width: "100%", "border-collapse": "collapse", background: "#fff", border: "1px solid #808080", "margin-bottom": "10px" }}>
                                <thead>
                                    <tr style={{ background: "#d0d0d0", "text-align": "left" }}>
                                        <th colSpan="2" style={{ padding: "4px", border: "1px solid #808080" }}>User Statistics</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "4px", border: "1px solid #808080" }}>Total Users:</td>
                                        <td align="right" style={{ padding: "4px", border: "1px solid #808080" }}><b>{stats().totalUsers}</b></td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "4px", border: "1px solid #808080" }}>Active (24h):</td>
                                        <td align="right" style={{ padding: "4px", border: "1px solid #808080" }}><b>{stats().activeUsers24h}</b></td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "4px", border: "1px solid #808080" }}>Active (7d):</td>
                                        <td align="right" style={{ padding: "4px", border: "1px solid #808080" }}><b>{stats().activeUsers7d}</b></td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "4px", border: "1px solid #808080" }}>Verified Hosts:</td>
                                        <td align="right" style={{ padding: "4px", border: "1px solid #808080" }}><b>{stats().verifiedRate}%</b></td>
                                    </tr>
                                </tbody>
                            </table>

                            <table style={{ width: "100%", "border-collapse": "collapse", background: "#fff", border: "1px solid #808080", "margin-bottom": "10px" }}>
                                <thead>
                                    <tr style={{ background: "#d0d0d0", "text-align": "left" }}>
                                        <th colSpan="2" style={{ padding: "4px", border: "1px solid #808080" }}>Age Demographics</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <For each={Object.entries(stats().ageBreakdown)}>
                                        {([range, count]) => (
                                            <tr>
                                                <td style={{ padding: "4px", border: "1px solid #808080" }}>{range}:</td>
                                                <td align="right" style={{ padding: "4px", border: "1px solid #808080" }}><b>{count}</b></td>
                                            </tr>
                                        )}
                                    </For>
                                </tbody>
                            </table>

                            <table style={{ width: "100%", "border-collapse": "collapse", background: "#fff", border: "1px solid #808080", "margin-bottom": "10px" }}>
                                <thead>
                                    <tr style={{ background: "#d0d0d0", "text-align": "left" }}>
                                        <th colSpan="2" style={{ padding: "4px", border: "1px solid #808080" }}>Geo Distribution</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <For each={Object.entries(stats().countriesBreakdown).sort(([, a], [, b]) => b - a).slice(0, 5)}>
                                        {([country, count]) => (
                                            <tr>
                                                <td style={{ padding: "4px", border: "1px solid #808080" }}>{country}:</td>
                                                <td align="right" style={{ padding: "4px", border: "1px solid #808080" }}><b>{count}</b></td>
                                            </tr>
                                        )}
                                    </For>
                                </tbody>
                            </table>
                        </div>

                        {/* Middle-Left Column: Revenue Matrix */}
                        <div style={{ "flex-grow": 1, "flex-basis": "300px" }}>
                            <table style={{ width: "100%", "border-collapse": "collapse", background: "#000", color: "#0f0", border: "1px solid #0f0", "margin-bottom": "10px" }}>
                                <thead>
                                    <tr style={{ background: "#0f0", color: "#000", "text-align": "left" }}>
                                        <th colSpan="3" style={{ padding: "4px", border: "1px solid #000" }}>REVENUE_MATRIX_LOG</th>
                                    </tr>
                                    <tr style={{ background: "#222", color: "#0f0" }}>
                                        <th style={{ padding: "4px", border: "1px solid #0f0" }}>Metric</th>
                                        <th align="right" style={{ padding: "4px", border: "1px solid #0f0" }}>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "4px", border: "1px solid #0f0" }}>Total Lifetime Revenue:</td>
                                        <td align="right" style={{ padding: "4px", border: "1px solid #0f0" }}><b>${stats().totalRevenue.toFixed(2)}</b></td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "4px", border: "1px solid #0f0" }}>Total System Calls:</td>
                                        <td align="right" style={{ padding: "4px", border: "1px solid #0f0" }}><b>{stats().totalCalls}</b></td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "4px", border: "1px solid #0f0" }}>Total Call Minutes:</td>
                                        <td align="right" style={{ padding: "4px", border: "1px solid #0f0" }}><b>{Math.round(stats().totalCallDuration / 60)}m</b></td>
                                    </tr>
                                </tbody>
                            </table>

                            <table style={{ width: "100%", "border-collapse": "collapse", background: "#fff", border: "1px solid #808080" }}>
                                <thead>
                                    <tr style={{ background: "#c00", color: "#fff", "text-align": "left" }}>
                                        <th colSpan="3" style={{ padding: "4px", border: "1px solid #808080" }}>Top Revenue Contributors</th>
                                    </tr>
                                    <tr style={{ background: "#d0d0d0" }}>
                                        <th width="30" style={{ padding: "4px", border: "1px solid #808080" }}>Rank</th>
                                        <th style={{ padding: "4px", border: "1px solid #808080" }}>User</th>
                                        <th align="right" style={{ padding: "4px", border: "1px solid #808080" }}>Spent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <For each={stats().topRevenueUsers}>
                                        {(user, index) => (
                                            <tr style={{ background: index() % 2 === 0 ? "#fff" : "#fff0f0" }}>
                                                <td align="center" style={{ padding: "4px", border: "1px solid #808080" }}>{index() + 1}</td>
                                                <td style={{ padding: "4px", border: "1px solid #808080" }}>
                                                    <div style={{ display: "flex", "align-items": "center", gap: "5px" }}>
                                                        {user.photo && <img src={user.photo} style={{ width: "16px", height: "16px", border: "1px solid #000" }} alt="" />}
                                                        <b>{user.name}</b>
                                                    </div>
                                                </td>
                                                <td align="right" style={{ padding: "4px", border: "1px solid #808080", color: "#c00" }}><b>${user.revenue.toFixed(2)}</b></td>
                                            </tr>
                                        )}
                                    </For>
                                </tbody>
                            </table>
                        </div>

                        {/* Middle-Right Column: Engagement */}
                        <div style={{ "flex-grow": 1, "flex-basis": "300px" }}>
                            <table style={{ width: "100%", "border-collapse": "collapse", background: "#fff", border: "1px solid #808080", "margin-bottom": "10px" }}>
                                <thead>
                                    <tr style={{ background: "#004080", color: "#fff", "text-align": "left" }}>
                                        <th colSpan="3" style={{ padding: "4px", border: "1px solid #808080" }}>Most Viewed Profiles</th>
                                    </tr>
                                    <tr style={{ background: "#d0d0d0" }}>
                                        <th width="30" style={{ padding: "4px", border: "1px solid #808080" }}>#</th>
                                        <th style={{ padding: "4px", border: "1px solid #808080" }}>Name</th>
                                        <th align="right" style={{ padding: "4px", border: "1px solid #808080" }}>Views</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <For each={stats().topViewedUsers}>
                                        {(user, index) => (
                                            <tr style={{ background: index() % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                                                <td align="center" style={{ padding: "4px", border: "1px solid #808080" }}>{index() + 1}</td>
                                                <td style={{ padding: "4px", border: "1px solid #808080" }}><b>{user.name}</b></td>
                                                <td align="right" style={{ padding: "4px", border: "1px solid #808080", color: "#c00" }}>{user.views}</td>
                                            </tr>
                                        )}
                                    </For>
                                </tbody>
                            </table>

                            <table style={{ width: "100%", "border-collapse": "collapse", background: "#fff", border: "1px solid #808080" }}>
                                <thead>
                                    <tr style={{ background: "#008040", color: "#fff", "text-align": "left" }}>
                                        <th colSpan="3" style={{ padding: "4px", border: "1px solid #808080" }}>User Chat Activity</th>
                                    </tr>
                                    <tr style={{ background: "#d0d0d0" }}>
                                        <th width="30" style={{ padding: "4px", border: "1px solid #808080" }}>#</th>
                                        <th style={{ padding: "4px", border: "1px solid #808080" }}>Name</th>
                                        <th align="right" style={{ padding: "4px", border: "1px solid #808080" }}>Chats</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <For each={stats().topChatters}>
                                        {(user, index) => (
                                            <tr style={{ background: index() % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                                                <td align="center" style={{ padding: "4px", border: "1px solid #808080" }}>{index() + 1}</td>
                                                <td style={{ padding: "4px", border: "1px solid #808080" }}><b>{user.name}</b></td>
                                                <td align="right" style={{ padding: "4px", border: "1px solid #808080", color: "#004080" }}>{user.chats}</td>
                                            </tr>
                                        )}
                                    </For>
                                </tbody>
                            </table>
                        </div>

                        {/* Right Column: Trends */}
                        <div style={{ "flex-basis": "200px", "flex-grow": 0 }}>
                            <table style={{ width: "100%", "border-collapse": "collapse", background: "#fff", border: "1px solid #808080", "margin-bottom": "10px" }}>
                                <thead>
                                    <tr style={{ background: "#d0d0d0", "text-align": "left" }}>
                                        <th colSpan="2" style={{ padding: "4px", border: "1px solid #808080" }}>Daily Registrations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <For each={registrationTrend().slice(-7).reverse()}>
                                        {([date, count]) => (
                                            <tr>
                                                <td style={{ padding: "4px", border: "1px solid #808080", "font-size": "10px" }}>{date}</td>
                                                <td align="right" style={{ padding: "4px", border: "1px solid #808080" }}>{count}</td>
                                            </tr>
                                        )}
                                    </For>
                                </tbody>
                            </table>

                            <table style={{ width: "100%", "border-collapse": "collapse", background: "#fff", border: "1px solid #808080" }}>
                                <thead>
                                    <tr style={{ background: "#d0d0d0", "text-align": "left" }}>
                                        <th colSpan="2" style={{ padding: "4px", border: "1px solid #808080" }}>Daily Revenue ($)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <For each={Object.entries(stats().revenueByDay).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime()).slice(0, 7)}>
                                        {([date, revenue]) => (
                                            <tr>
                                                <td style={{ padding: "4px", border: "1px solid #808080", "font-size": "10px" }}>{date}</td>
                                                <td align="right" style={{ padding: "4px", border: "1px solid #808080" }}>${revenue.toFixed(2)}</td>
                                            </tr>
                                        )}
                                    </For>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* System Footer */}
                    <div style={{
                        "margin-top": "20px",
                        "border-top": "1px solid #808080",
                        padding: "5px 0",
                        "font-size": "10px",
                        color: "#666"
                    }}>
                        Last updated: {new Date().toLocaleString()}
                    </div>
                </Show>
            </div>
        </AdminLayout>
    );
}
