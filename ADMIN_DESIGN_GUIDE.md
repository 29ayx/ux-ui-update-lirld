

## 1. Design Philosophy
The design follows a **"Neural/Matrix"** theme. It should look like a command center for an advanced AI or a global network monitor.
- **Vibe**: High-tech, clean, italicized power, and data-driven.
- **Depth**: Use glassmorphism (`backdrop-blur`), subtle gradients, and deep shadows.

## 2. Color Palette
| Category | Colors / Gradients | Usage |
| :--- | :--- | :--- |
| **Primary** | `slate-900`, `slate-800` | Backgrounds, text, and main containers. |
| **Accent (Intelligence)** | `blue-600`, `indigo-600` | Primary actions, "Active" states, and branding. |
| **Accent (Network)** | `emerald-500`, `emerald-600` | Hosts, success states, and "Approved" nodes. |
| **Accent (Alert/Buffer)** | `amber-500`, `rose-600` | Pending items, terminators, and warnings. |
| **Backgrounds** | `white/70 backdrop-blur-2xl` | Table rows and cards. |

ALL the text should be between 80%-100% constast ration

## 3. Typography
- **Headings**: `font-black`, `tracking-tighter`, often `italic`.
- **Subtext/Labels**: `text-[10px]`, `font-black`, `uppercase`, `tracking-[0.2em]`.
- **Keywords**: Use gradient text for emphasis (e.g., `bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600`).

## 4. Iconography
- **Library**: `solid-icons/hi` (Heroicons) and `solid-icons/io` (Ionicons).
- **Placement**:
    - **Backdrops**: Large, low-opacity icons in the bottom-right corner of cards (`opacity-50`, `w-40 h-40`).
    - **Buttons**: Icons inside circular/rounded containers with subtle shadows.
- **Common Icons**:
    - `HiSolidUserGroup` (Global Entities)
    - `HiSolidPhone` (Active Nodes)
    - `IoFlash` (Neural Shortcuts)
    - `IoEarth` (Geographic Clusters)

## 5. Layout & Placements
- **Radius**: Use large, rounded corners (`rounded-[2.5rem]` or `rounded-[3rem]`).
- **Cards**: Oversized padding (`p-8` to `p-10`) with `hover:-translate-y-2` transitions.
- **Tables**: `border-separate border-spacing-y-4` for a "floating row" effect. Each row should have its own background and shadow.
- **Header Section**: Always include a "System Latency" or "Sync Priority" indicator to reinforce the tech theme.


## 7. Interactive Elements
- **Micro-animations**: Use `animate-pulse` for "Active" signals and `animate-ping` for real-time metrics.
- **Hover Effects**: Rows and buttons should scale slightly or rotate (`hover:scale-105`, `hover:rotate-2`).
