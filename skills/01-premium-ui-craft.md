# Skill: Premium UI Craft & Clinical Design System

> **Scope**: Governs all user interface design, styling, and ergonomics in `frontend/`.  
> **Art Direction Partner**: Strictly integrated with `Leonxlnx/taste-skill` ([`.agents/skills/design-taste-frontend/SKILL.md`](file:///d:/My%20Projects/Dossia/.agents/skills/design-taste-frontend/SKILL.md)).  
> **Target Aesthetic**: Executive, surgical, high-density clinical SaaS.

---

## 1. Visual Anti-Patterns (Banned AI Tropes)

AI-generated interfaces frequently rely on decorative gimmicks that compromise professional credibility and usability. The following patterns are strictly forbidden (aligned with both Dossia rules and `design-taste-frontend` house rules):

| Anti-Pattern | Rule | Enforced Alternative |
| :--- | :--- | :--- |
| **Neon Gradients** | ❌ Banned (`bg-gradient-to-r from-blue-500 to-indigo-600`) | Solid, deliberate zinc surfaces with a single subtle accent. |
| **Glassmorphism Blobs** | ❌ Banned (heavy blur, decorative background spheres) | Clean, flat panels with 1px hairline borders. |
| **Glowing Card Borders** | ❌ Banned (`box-shadow: 0 0 20px rgba(...)`) | Hairline `border-zinc-200 dark:border-zinc-800`. |
| **Oversized Radiuses** | ❌ Banned (`rounded-3xl`, `rounded-2xl` on standard cards) | Crisp `rounded-md` (6px) or `rounded-lg` (8px). |
| **Heavy Drop Shadows** | ❌ Banned (`shadow-2xl`, dramatic floating cards) | Subtle ambient elevation (`shadow-xs` / `shadow-sm`). |
| **Icon Inconsistency** | ❌ Banned (mixed icon packs, emojis, varying stroke weights) | Strict Lucide icon standardization (`w-4 h-4` with `stroke-[1.5]`). |

---

## 2. Typography & Numerical Precision

Medical and financial data require absolute visual stability. Shifting digits during updates or scrolling destroy trust and legibility.

1. **Font Hierarchy**:
   - Primary Body: `Inter`, `Geist Sans`, or `SF Pro`.
   - Brand Display: `Outfit` (used sparingly for landing headings).
   - Variance Rule: Minimize font size leaps. Rely on weight (`font-medium` vs `font-normal`) and color tone (`text-zinc-900` vs `text-zinc-500`) to communicate hierarchy.

2. **Mandatory Monospace Alignment**:
   - **ALWAYS** apply `tabular-nums font-mono` to:
     - Monetary amounts in MAD (e.g., `<span className="tabular-nums font-mono">350.00 MAD</span>`).
     - Appointment time slots (e.g., `<span className="tabular-nums font-mono">09:30 - 10:00</span>`).
     - Moroccan phone numbers (e.g., `<span className="tabular-nums font-mono">+212 661-234567</span>`).
     - National and institutional identifiers (`INPE`, `ICE`, `CNSS`, `AMO`).

---

## 3. High-Density Layouts (Secretary Mode)

The medical assistant cannot afford continuous vertical scrolling or nested accordions while juggling phone calls and front-desk reception.

1. **Table Density Standards**:
   - Table row height must be compact: `h-9` (36px) or `h-10` (40px).
   - Cell padding standard: `py-2 px-3 text-xs` or `text-sm`.
   - Header formatting: `text-[11px] font-medium uppercase tracking-wider text-zinc-500`.

2. **Form Controls**:
   - Input height: `h-8` (32px) with `px-2.5 text-xs`.
   - Button heights: default `h-9 px-3.5 text-xs`, compact `h-8 px-2.5 text-xs`.
   - Select dropdowns and date pickers must align with the same 32px height baseline.

3. **State Transitions**:
   - Every view must have explicit empty states with actionable triggers.
   - Use skeleton loaders matching exact table row dimensions to prevent layout shifts.
   - Smooth, non-distracting transitions (`duration-150 ease-out`).

---

## 4. Color Palette & Dual-Theme System

Dossia provides equal, flawless support for both **Light Mode** (default in brightly lit clinical cabinets) and **Dark Mode**.

### Token Matrix

| Element | Light Mode (`:root`) | Dark Mode (`.dark`) |
| :--- | :--- | :--- |
| **Canvas Background** | Pure White (`#FFFFFF`) | Deep Zinc (`#09090B`) |
| **Surface / Card** | Pure White (`#FFFFFF`) or off-white (`#FAFAFA`) | Zinc 950 (`#111118`) |
| **Hairline Borders** | `border-zinc-200` (`#E4E4E7`) | `border-zinc-800` (`#27272A`) |
| **Primary Text** | `text-zinc-950` (`#09090B`) | `text-zinc-100` (`#F4F4F5`) |
| **Muted Text** | `text-zinc-500` (`#71717A`) | `text-zinc-400` (`#A1A1AA`) |
| **Clinical Accent** | Emerald 600 (`#059669`) | Emerald 400 (`#34D399`) |
| **Clinical Warning** | Amber 600 (`#D97706`) | Amber 400 (`#FBBF24`) |
| **Clinical Danger** | Red 600 (`#DC2626`) | Red 400 (`#F87171`) |

> **Accent Rule**: Never use more than one dominant brand color in functional views. Clinical statuses must use restrained badge colors with dedicated light and dark variants.

---

## 5. Component Primitives & Ergonomics

All interactive elements must be built on top of accessible primitives (Radix UI / shadcn/ui pattern):
- **Dialogs & Drawers**: Backdrop overlay with `bg-black/50 dark:bg-black/75 backdrop-blur-xs`, centered dialog or side-sheet drawer with 1px border.
- **Command Palette (`Ctrl+K`)**: Global modal searchable action launcher with keyboard navigation (`Up`, `Down`, `Enter`, `Escape`).
- **Keyboard Shortcuts**: Every critical action must have a bound key combination visible via `<kbd className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">` tags.

---

## 6. Taste-Skill Integration & Dual-Mode Dials

`Agent Frontend-Craft` enforces `Leonxlnx/taste-skill` ([`.agents/skills/design-taste-frontend/SKILL.md`](file:///d:/My%20Projects/Dossia/.agents/skills/design-taste-frontend/SKILL.md)) alongside Dossia's clinical guidelines. All UI work must respect two mandatory project constraints:

### 1. Stack Constraint (Pure React 18 + Vite SPA)
- Dossia is a **React 18 + Vite + TypeScript SPA** (not Next.js).
- **Ignore all Next.js Server Component rules**: Never add `'use client'` pragmas, never reference `next/navigation`, `next/font`, or App Router server actions.
- Use standard client-side imports (e.g., `react-router-dom`, `zustand`, standard CSS / Tailwind v4).

### 2. Dual-Mode Dials Matrix

| Dimension | Public Marketing Pages (`/frontend/src/pages/Landing.tsx`) | Clinical & Financial Workspaces (`/app/*`, `/admin/*`) |
| :--- | :--- | :--- |
| **Target Route** | Public Landing & Moroccan Clinic ROI Calculator | Secretary Agenda, Waiting Room, Doctor Cockpit, Caisse, Admin |
| **Design Variance** | `DESIGN_VARIANCE = 7` (High expressiveness) | `DESIGN_VARIANCE = 3` (Low variance, ultra-predictable layout) |
| **Motion Intensity** | `MOTION_INTENSITY = 6` (Fluid spring physics, 3D canvas) | `MOTION_INTENSITY = 3` (Functional transitions, duration <= 150ms) |
| **Visual Density** | `VISUAL_DENSITY = 4` (Generous editorial whitespace) | `VISUAL_DENSITY = 9` (Maximum data density, 36–40px table rows) |
| **Typography** | `Geist Sans`, `Satoshi`, or `Outfit` display headings | Standard `Inter` / `Geist` body; strict `tabular-nums font-mono` numbers |
| **Layout Device** | Asymmetric hero compositions, editorial typography, anti-slop blueprints | **Dashboard Hardening**: Ban bloated cards; use `divide-y` and hairline borders |
| **Monospace Rule** | Monospace only in designated code/data widgets | Mandatory `tabular-nums font-mono` for MAD, vitals, CIN, INPE, time slots |
| **Color Accents** | Dealt brand palette with emerald highlights and subtle contrast | Deep Zinc (`#09090B`) canvas, Zinc 950 cards, Emerald (`#059669`) action accent |
| **Card / Container** | Custom editorial blocks; ban cookie-cutter 3-column equal cards | Flat panels with hairline `border-zinc-200 dark:border-zinc-800` |
| **Interaction SLA** | Engaging storytelling, interactive ROI sliders | Strict **3-Second SLA**, zero layout shifts, `Ctrl+K` palette, keyboard first |

### 3. Dashboard Hardening Directives for Clinical & Financial Views
When operating in `/app/*` and `/admin/*`:
1. **Ban Bloated Card Containers**: Do not wrap every small metric or form block in heavy padded cards with drop shadows or thick borders.
2. **Structural Divide-Y**: Separate line items, ledger entries, and patient queues using clean `divide-y divide-zinc-200 dark:divide-zinc-800`.
3. **Hairline Precision**: Demarcate boundaries exclusively with hairline `border-zinc-200 dark:border-zinc-800`.
4. **Mandatory Monospace**: All Moroccan Dirham amounts (e.g., `350.00 MAD`), appointment hours (`09:30`), phone numbers (`+212...`), CINs, and vitals (`120/80 mmHg`, `72 bpm`) must be wrapped in `tabular-nums font-mono`.
5. **Color Discipline**: Strict adherence to Deep Zinc canvas (`#09090B`), Zinc 950 surfaces (`#111118`), and Emerald (`#059669`) for primary clinical calls to action.
