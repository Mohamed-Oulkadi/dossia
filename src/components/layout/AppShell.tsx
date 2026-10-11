/**
 * AppShell — Collapsible sidebar + topbar layout
 * Refactored for Clinical Craft & Executive SaaS Design System
 * 
 * - Standardized Lucide icons: w-4 h-4 stroke-[1.5]
 * - 1px hairline border system (border-zinc-800)
 * - Restrained typography and zero neon gradients
 * - Integration of Radix ActionModals & CommandPalette
 */
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { CommandPalette } from '@/pages/Dashboard/CommandPalette'
import { ActionModals } from '@/components/modals/ActionModals'
import {
  Calendar,
  Users,
  Pill,
  CreditCard,
  FileText,
  Settings,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Stethoscope,
} from 'lucide-react'

// ─────────────────────────────────────────────────
// Sidebar nav items
// ─────────────────────────────────────────────────
interface NavItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  to: string
  shortcut?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'nav-agenda',    icon: Calendar,    label: 'Agenda',        to: '/app',            shortcut: 'Alt+A' },
  { id: 'nav-patients',  icon: Users,       label: 'Patients',      to: '/app/patients'    },
  { id: 'nav-ordo',      icon: Pill,        label: 'Ordonnances',   to: '/app/ordonnances' },
  { id: 'nav-payments',  icon: CreditCard,  label: 'Paiements',     to: '/app/paiements'   },
  { id: 'nav-cnss',      icon: FileText,    label: 'CNSS / AMO',    to: '/app/cnss'        },
  { id: 'nav-settings',  icon: Settings,    label: 'Paramètres',    to: '/app/parametres'  },
]

// ─────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────
function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const location = useLocation()

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 56 : 216 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="
        flex-shrink-0 h-full flex flex-col
        bg-zinc-950
        border-r border-zinc-800
        overflow-hidden select-none
      "
    >
      {/* Brand Header */}
      <div className="h-12 flex items-center gap-2.5 px-3.5 border-b border-zinc-800">
        <div className="
          w-7 h-7 flex-shrink-0 rounded-md
          bg-zinc-900 border border-zinc-800
          flex items-center justify-center text-zinc-100
        ">
          <Stethoscope className="w-4 h-4 text-emerald-500 stroke-[1.5]" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-sm font-semibold tracking-tight text-zinc-100 whitespace-nowrap">
              Dossia
            </span>
            <span className="text-[10px] font-mono px-1 py-0.2 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded">
              PRO
            </span>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-2.5 space-y-0.5 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to ||
            (item.to !== '/app' && location.pathname.startsWith(item.to))

          return (
            <Link
              key={item.id}
              id={item.id}
              to={item.to}
              title={sidebarCollapsed ? item.label : undefined}
              className={`
                flex items-center gap-2.5 px-2.5 py-1.5 rounded-md
                text-xs transition-colors group relative
                ${isActive
                  ? 'bg-zinc-900 text-zinc-100 font-medium border border-zinc-800'
                  : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 border border-transparent'
                }
              `}
            >
              <span className="flex-shrink-0 flex items-center justify-center">
                <Icon className={`w-4 h-4 stroke-[1.5] ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
              </span>
              {!sidebarCollapsed && (
                <span className="flex-1 truncate">
                  {item.label}
                </span>
              )}
              {!sidebarCollapsed && item.shortcut && (
                <kbd className="
                  text-[9px] border border-zinc-800
                  px-1 py-0.5 rounded font-mono
                  text-zinc-500 bg-zinc-900
                  opacity-0 group-hover:opacity-100 transition-opacity
                ">
                  {item.shortcut}
                </kbd>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-zinc-800">
        <button
          id="sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Développer' : 'Réduire'}
          className="
            w-full flex items-center justify-center gap-2 px-2 py-1.5
            rounded-md text-zinc-400
            hover:bg-zinc-900 hover:text-zinc-200
            transition-colors text-xs cursor-pointer
          "
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 stroke-[1.5]" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 stroke-[1.5]" />
              <span className="text-[11px] font-medium">Réduire</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}

// ─────────────────────────────────────────────────
// Top bar
// ─────────────────────────────────────────────────
function Topbar() {
  const { openCommandPalette } = useAppStore()

  return (
    <header className="
      flex-shrink-0 h-12 flex items-center justify-between
      px-4 border-b border-zinc-800
      bg-zinc-950 select-none
    ">
      {/* Search / command palette trigger */}
      <button
        id="topbar-search"
        onClick={openCommandPalette}
        className="
          flex items-center gap-2 px-2.5 py-1 rounded-md
          border border-zinc-800 bg-zinc-900/60
          text-zinc-400 text-xs
          hover:border-zinc-700 hover:text-zinc-200
          transition-colors cursor-pointer
          w-56 sm:w-64
        "
      >
        <Search className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
        <span className="flex-1 text-left text-[11px]">Rechercher ou agir…</span>
        <kbd className="
          text-[10px] border border-zinc-800
          px-1.5 py-0.5 rounded font-mono text-zinc-400 bg-zinc-900
        ">
          Ctrl K
        </kbd>
      </button>

      {/* Right: doctor info */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-medium text-zinc-200">
            Dr. Rachid Amrani
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            INPE: MA-2021-0042 · Agadir
          </span>
        </div>
        <div className="
          w-7 h-7 rounded-md flex items-center justify-center text-xs
          bg-zinc-900 border border-zinc-800
          text-zinc-200 font-mono font-medium
        ">
          RA
        </div>
      </div>
    </header>
  )
}

// ─────────────────────────────────────────────────
// AppShell — exported layout wrapper
// ─────────────────────────────────────────────────
interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-hidden flex flex-col bg-zinc-950">
          {children}
        </main>
      </div>

      {/* Global overlays & Radix Dialogs */}
      <CommandPalette />
      <ActionModals />
    </div>
  )
}
