/**
 * AppShell — Collapsible sidebar + topbar layout
 * Agent B scope: src/components/layout/
 *
 * Secretary-First: keyboard shortcuts visible, dense info, fast navigation.
 * Language: Professional French (AGENTS.md)
 */
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { CommandPalette } from '@/pages/Dashboard/CommandPalette'

// ─────────────────────────────────────────────────
// Sidebar nav items
// ─────────────────────────────────────────────────
interface NavItem {
  id: string
  icon: string
  label: string
  to: string
  shortcut?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'nav-agenda',    icon: '📅', label: 'Agenda',        to: '/app',           shortcut: 'Alt+A' },
  { id: 'nav-patients',  icon: '👤', label: 'Patients',      to: '/app/patients'   },
  { id: 'nav-ordo',      icon: '💊', label: 'Ordonnances',   to: '/app/ordonnances' },
  { id: 'nav-payments',  icon: '💰', label: 'Paiements',     to: '/app/paiements'  },
  { id: 'nav-cnss',      icon: '📄', label: 'CNSS / AMO',    to: '/app/cnss'       },
  { id: 'nav-settings',  icon: '⚙️',  label: 'Paramètres',   to: '/app/parametres' },
]

// ─────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────
function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const location = useLocation()

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 60 : 220 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="
        flex-shrink-0 h-full flex flex-col
        bg-[var(--color-dossia-surface)]
        border-r border-[var(--color-dossia-border)]
        overflow-hidden
      "
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--color-dossia-border)]">
        <div className="
          w-8 h-8 flex-shrink-0 rounded-lg
          bg-[var(--color-dossia-accent)]/10
          border border-[var(--color-dossia-accent)]/20
          flex items-center justify-center text-base
        ">
          ✦
        </div>
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="gradient-text text-base font-bold tracking-tight whitespace-nowrap overflow-hidden"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Dossia
          </motion.span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to ||
            (item.to !== '/app' && location.pathname.startsWith(item.to))

          return (
            <Link
              key={item.id}
              id={item.id}
              to={item.to}
              title={sidebarCollapsed ? item.label : undefined}
              className={`
                flex items-center gap-3 px-2 py-2 rounded-lg
                text-sm transition-all duration-150 group relative
                ${isActive
                  ? 'bg-[var(--color-dossia-accent)]/10 text-[var(--color-dossia-accent)]'
                  : 'text-[var(--color-dossia-muted)] hover:bg-[var(--color-dossia-surface2)] hover:text-[var(--color-dossia-text)]'
                }
              `}
            >
              <span className="text-base flex-shrink-0 w-6 text-center">
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <motion.span
                  initial={false}
                  animate={{ opacity: 1 }}
                  className="flex-1 font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
              {!sidebarCollapsed && item.shortcut && (
                <kbd className="
                  text-[9px] border border-[var(--color-dossia-border)]
                  px-1 py-0.5 rounded font-mono
                  text-[var(--color-dossia-muted)]
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
      <div className="p-2 border-t border-[var(--color-dossia-border)]">
        <button
          id="sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Développer' : 'Réduire'}
          className="
            w-full flex items-center justify-center gap-2 px-2 py-2
            rounded-lg text-[var(--color-dossia-muted)]
            hover:bg-[var(--color-dossia-surface2)]
            hover:text-[var(--color-dossia-text)]
            transition-colors text-sm
          "
        >
          <motion.span
            animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-base"
          >
            ◀
          </motion.span>
          {!sidebarCollapsed && (
            <span className="text-xs font-medium">Réduire</span>
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
      px-4 border-b border-[var(--color-dossia-border)]
      bg-[var(--color-dossia-surface)]/80 backdrop-blur-sm
    ">
      {/* Search / command palette trigger */}
      <button
        id="topbar-search"
        onClick={openCommandPalette}
        className="
          flex items-center gap-2.5 px-3 py-1.5 rounded-lg
          glass border border-[var(--color-dossia-border)]
          text-[var(--color-dossia-muted)] text-sm
          hover:border-[var(--color-dossia-accent)]/40
          hover:text-[var(--color-dossia-text)]
          transition-all duration-150
          min-w-[220px]
        "
      >
        <span className="text-xs">🔍</span>
        <span className="flex-1 text-left text-xs">Rechercher ou agir…</span>
        <kbd className="
          text-[10px] border border-[var(--color-dossia-border)]
          px-1.5 py-0.5 rounded font-mono
        ">
          Ctrl K
        </kbd>
      </button>

      {/* Right: doctor info */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-medium text-[var(--color-dossia-text)]">
            Dr. Rachid Amrani
          </span>
          <span className="text-[10px] text-[var(--color-dossia-muted)]">
            Médecine Générale · Agadir
          </span>
        </div>
        <div className="
          w-8 h-8 rounded-full flex items-center justify-center text-sm
          bg-[var(--color-dossia-accent)]/10
          border border-[var(--color-dossia-accent)]/20
          text-[var(--color-dossia-accent)]
          font-semibold
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
    <div className="flex h-screen overflow-hidden bg-[var(--color-dossia-bg)]">
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>

      {/* Global overlays */}
      <CommandPalette />
    </div>
  )
}
