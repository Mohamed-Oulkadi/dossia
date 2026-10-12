/**
 * AppShell — Collapsible sidebar + topbar layout
 * Dual-Theme Support (Light Mode / Dark Mode)
 * Multi-Tenancy & CNDP Law 09-08 User Identity Display
 */
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
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
  Sun,
  Moon,
  LogOut,
  Lock,
} from 'lucide-react'
import { DossiaLogo } from '@/components/ui/DossiaLogo'
import { toast } from 'sonner'

// ─────────────────────────────────────────────────
// Sidebar nav items
// ─────────────────────────────────────────────────
interface NavItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  to: string
  shortcut?: string
  doctorOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: 'nav-agenda',    icon: Calendar,    label: 'Agenda',        to: '/app',            shortcut: 'Alt+A' },
  { id: 'nav-patients',  icon: Users,       label: 'Patients',      to: '/app/patients'    },
  { id: 'nav-ordo',      icon: Pill,        label: 'Ordonnances',   to: '/app/ordonnances', doctorOnly: true },
  { id: 'nav-payments',  icon: CreditCard,  label: 'Paiements',     to: '/app/paiements'   },
  { id: 'nav-cnss',      icon: FileText,    label: 'CNSS / AMO',    to: '/app/cnss'        },
  { id: 'nav-settings',  icon: Settings,    label: 'Paramètres',    to: '/app/parametres'  },
]

// ─────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────
function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useAppStore()
  const { role, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.info('Déconnexion effectuée', {
      description: 'À bientôt sur Dossia.',
    })
    navigate('/login')
  }

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 56 : 216 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="
        flex-shrink-0 h-full flex flex-col
        bg-white dark:bg-zinc-950
        border-r border-zinc-200 dark:border-zinc-800
        overflow-hidden select-none transition-colors
      "
    >
      {/* Brand Header */}
      <div className="h-12 flex items-center gap-2.5 px-3.5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="
          w-7 h-7 flex-shrink-0 rounded-md
          bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/30
          flex items-center justify-center text-emerald-600 dark:text-emerald-400
        ">
          <DossiaLogo className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
              Dossia
            </span>
            <span className="text-[10px] font-mono px-1 py-0.2 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded">
              PRO
            </span>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-2.5 space-y-0.5 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isDoctorLocked = item.doctorOnly && role === 'SECRETARY'
          const isActive = location.pathname === item.to ||
            (item.to !== '/app' && location.pathname.startsWith(item.to))

          return (
            <Link
              key={item.id}
              id={item.id}
              to={item.to}
              title={sidebarCollapsed ? (isDoctorLocked ? `${item.label} (Médecin uniquement)` : item.label) : undefined}
              className={`
                flex items-center gap-2.5 px-2.5 py-1.5 rounded-md
                text-xs transition-colors group relative
                ${isActive
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium border border-zinc-200 dark:border-zinc-800'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
                }
                ${isDoctorLocked ? 'opacity-65' : ''}
              `}
            >
              <span className="flex-shrink-0 flex items-center justify-center">
                <Icon className={`w-4 h-4 stroke-[1.5] ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'}`} />
              </span>
              {!sidebarCollapsed && (
                <span className="flex-1 truncate">
                  {item.label}
                </span>
              )}
              {!sidebarCollapsed && isDoctorLocked && (
                <Lock className="w-3 h-3 text-zinc-400 stroke-[1.5]" />
              )}
              {!sidebarCollapsed && !isDoctorLocked && item.shortcut && (
                <kbd className="
                  text-[9px] border border-zinc-200 dark:border-zinc-800
                  px-1 py-0.5 rounded font-mono
                  text-zinc-500 bg-zinc-50 dark:bg-zinc-900
                  opacity-0 group-hover:opacity-100 transition-opacity
                ">
                  {item.shortcut}
                </kbd>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom controls */}
      <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
        {/* Theme toggle in sidebar */}
        <button
          id="sidebar-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
          className="
            w-full flex items-center justify-center gap-2 px-2 py-1.5
            rounded-md text-zinc-600 dark:text-zinc-400
            hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200
            transition-colors text-xs cursor-pointer
          "
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 stroke-[1.5]" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-600 stroke-[1.5]" />
          )}
          {!sidebarCollapsed && (
            <span className="text-[11px] font-medium flex-1 text-left">
              {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </span>
          )}
        </button>

        {/* Logout button */}
        <button
          id="sidebar-logout"
          onClick={handleLogout}
          title="Se déconnecter"
          className="
            w-full flex items-center justify-center gap-2 px-2 py-1.5
            rounded-md text-red-600 dark:text-red-400
            hover:bg-red-50 dark:hover:bg-red-950/30
            transition-colors text-xs cursor-pointer
          "
        >
          <LogOut className="w-4 h-4 stroke-[1.5]" />
          {!sidebarCollapsed && (
            <span className="text-[11px] font-medium flex-1 text-left">
              Déconnexion
            </span>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          id="sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Développer' : 'Réduire'}
          className="
            w-full flex items-center justify-center gap-2 px-2 py-1.5
            rounded-md text-zinc-600 dark:text-zinc-400
            hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200
            transition-colors text-xs cursor-pointer
          "
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 stroke-[1.5]" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 stroke-[1.5]" />
              <span className="text-[11px] font-medium flex-1 text-left">Réduire</span>
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
  const { openCommandPalette, theme, toggleTheme } = useAppStore()
  const { user, role, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.info('Déconnexion effectuée', {
      description: 'À bientôt sur Dossia.',
    })
    navigate('/login')
  }

  const displayName = user
    ? (role === 'DOCTOR' ? `Dr. ${user.firstName} ${user.lastName}` : `${user.firstName} ${user.lastName}`)
    : 'Dr. Rachid Amrani'

  const roleLabel = role === 'DOCTOR'
    ? 'Médecin Praticien'
    : role === 'SECRETARY'
    ? 'Secrétaire Médicale'
    : 'Super Admin'

  const initials = user
    ? `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase()
    : 'RA'

  const clinicName = user?.clinicName || 'Clinique Ibn Sina Agadir'

  return (
    <header className="
      flex-shrink-0 h-12 flex items-center justify-between
      px-4 border-b border-zinc-200 dark:border-zinc-800
      bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xs select-none transition-colors
    ">
      {/* Search / command palette trigger */}
      <button
        id="topbar-search"
        onClick={openCommandPalette}
        className="
          flex items-center gap-2 px-2.5 py-1 rounded-md
          border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60
          text-zinc-500 dark:text-zinc-400 text-xs
          hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200
          transition-colors cursor-pointer
          w-56 sm:w-64
        "
      >
        <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 stroke-[1.5]" />
        <span className="flex-1 text-left text-[11px]">Rechercher ou agir…</span>
        <kbd className="
          text-[10px] border border-zinc-200 dark:border-zinc-800
          px-1.5 py-0.5 rounded font-mono text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900
        ">
          Ctrl K
        </kbd>
      </button>

      {/* Right controls: Theme Switcher, Identity & Logout */}
      <div className="flex items-center gap-3">
        {/* Header Theme Switcher Button */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          className="
            p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800
            bg-zinc-50 dark:bg-zinc-900/60
            text-zinc-600 dark:text-zinc-400
            hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800
            transition-colors cursor-pointer
          "
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 stroke-[1.5]" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-700 stroke-[1.5]" />
          )}
        </button>

        {/* Authenticated User Details */}
        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-200">
              {displayName}
            </span>
            <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${
              role === 'DOCTOR'
                ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                : role === 'SECRETARY'
                ? 'text-blue-600 dark:text-blue-400 border-blue-500/20 bg-blue-500/10'
                : 'text-zinc-600 dark:text-zinc-400 border-zinc-500/20 bg-zinc-500/10'
            }`}>
              {roleLabel}
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 truncate max-w-48">
            {clinicName}
          </span>
        </div>

        <div className="
          w-7 h-7 rounded-md flex items-center justify-center text-xs
          bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
          text-zinc-800 dark:text-zinc-200 font-mono font-medium
        ">
          {initials}
        </div>

        {/* Topbar Logout Button */}
        <button
          onClick={handleLogout}
          title="Se déconnecter"
          className="
            p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800
            bg-zinc-50 dark:bg-zinc-900/60
            text-zinc-500 hover:text-red-600 dark:hover:text-red-400
            hover:bg-red-50 dark:hover:bg-red-950/20
            transition-colors cursor-pointer
          "
        >
          <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>
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
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-950">
          {children}
        </main>
      </div>

      {/* Global overlays & Radix Dialogs */}
      <CommandPalette />
      <ActionModals />
    </div>
  )
}
