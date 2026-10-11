# Skill: Frontend Craft & Clinical Design System

## 1. Visual Anti-Patterns (Banned AI Tropes)
- NEVER use neon gradients (e.g., `bg-gradient-to-r from-blue-500 to-indigo-600`).
- NEVER use excessive blurs, floating glassmorphism blobs, or glowing card borders.
- NEVER use oversized corner radiuses (`rounded-3xl` or `rounded-2xl` on standard cards). Stick to `rounded-md` (6px) or `rounded-lg` (8px).
- NEVER use floating cards with heavy dropped shadows (`shadow-2xl`). Use hairline borders (`border border-zinc-200 dark:border-zinc-800`) with subtle ambient shadows (`shadow-xs`).
- NEVER use generic Lucide icon soup. Every icon must share an identical stroke width (`stroke-[1.5]`) and size (16px or 18px).

## 2. Typography & Numbers
- Primary Font: Inter, Geist Sans, or SF Pro.
- Moroccan Financials & Dates: ALWAYS use `tabular-nums font-mono` for amounts in MAD, phone numbers (+212), and timestamps to prevent layout shifts.
- Information Hierarchy: Minimize font size variance. Use font weight (`font-medium` vs `font-normal`) and color tone (`text-zinc-900` vs `text-zinc-500`) rather than jumping between giant headers.

## 3. High-Density Layouts (Secretary Mode)
- The medical secretary cannot scroll endlessly. Default table row height must be compact (`h-9` or `h-10`).
- Standard data cells: `px-3 py-2 text-xs` or `text-sm`.
- Form inputs must be compact (`h-8` or `h-9` with `px-2.5 text-xs` or `text-sm`).
- Every view must have defined empty states, skeleton loaders, and zero-layout-shift transitions.

## 4. Color Palette (Surgical & Restrained)
- Background: Pure White (`#FFFFFF`) or off-white (`#FAFAFA`) / Dark Mode: Deep Zinc (`#09090B`).
- Surface: Crisp borders with `zinc-200` / `zinc-800`.
- Accent: A single restrained clinical color—e.g., deep emerald (`emerald-600`) or surgical sapphire (`sky-700`). Never more than one dominant brand color in functional views.