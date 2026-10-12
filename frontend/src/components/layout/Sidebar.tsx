import React from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { DossiaLogo } from '@/components/ui/DossiaLogo'
import {
  Calendar,
  Users,
  CreditCard,
  Stethoscope,
  FileText,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react'
import { toast } from 'sonner'

export interface NavItemConfig {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  to: string
  shortcut?: string
  doctorOnly?: boolean
}

const ALL_NAV_ITEMS: NavItemConfig[] = [
  { id: 'nav-agenda', icon: Calendar, label: 'Agenda', to: '/app', shortcut: 'Alt+A' },
  { id: 'nav-patients', icon: Users, label: 'Patients', to: '/app/patients', shortcut: 'Alt+P' },
  { id: 'nav-caisse', icon: CreditCard, label: 'Caisse & Facturation', to: '/app/caisse', shortcut: 'Alt+C' },
  { id: 'nav-consultations', icon: Stethoscope, label: 'Espace Clinique', to: '/app/consultations', doctorOnly: true, shortcut: 'Alt+E' },
  { id: 'nav-cnss', icon: FileText, label: 'CNSS / AMO', to: '/app/cnss' },
  { id: 'nav-settings', icon: Settings, label: 'Paramètres du Cabinet', to: '/app/parametres', doctorOnly: true },
]

export function Sidebar() {
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

  // Filter navigation links based on user role (Secretary never sees Doctor clinical links)
  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.doctorOnly && role !== 'DOCTOR') {
      return false
    }
    return true
  })

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 56 : 220 }}
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
            <span className="text-[10px] font-mono px-1 py-0.2 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded font-medium">
              {role === 'DOCTOR' ? 'MÉDECIN' : 'SECRÉTAIRE'}
            </span>
          </div>
        )}
      </div>

      {/* Nav items list */}
      <nav className="flex-1 py-2.5 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isExactApp = item.to === '/app' && (location.pathname === '/app' || location.pathname === '/app/')
          const isSubActive = item.to !== '/app' && location.pathname.startsWith(item.to)
          const isConsultationAlias = item.to === '/app/consultations' && (location.pathname.startsWith('/app/consultation') || location.pathname.startsWith('/app/ordonnances'))
          const isCaisseAlias = item.to === '/app/caisse' && location.pathname.startsWith('/app/paiements')

          const isActive = isExactApp || isSubActive || isConsultationAlias || isCaisseAlias

          return (
            <Link
              key={item.id}
              id={item.id}
              to={item.to}
              title={sidebarCollapsed ? item.label : undefined}
              className={`
                flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-all group relative
                ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-medium border-l-2 border-emerald-600 dark:border-emerald-500 border-t border-b border-r border-zinc-200/80 dark:border-zinc-700/60 shadow-2xs'
                    : 'border-l-2 border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                }
              `}
            >
              <span className="flex-shrink-0 flex items-center justify-center">
                <Icon
                  className={`w-4 h-4 stroke-[1.5] ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                  }`}
                />
              </span>

              {!sidebarCollapsed && (
                <span className="flex-1 truncate">
                  {item.label}
                </span>
              )}

              {!sidebarCollapsed && item.shortcut && (
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
