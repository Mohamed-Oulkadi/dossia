import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { DossiaLogo } from '@/components/ui/DossiaLogo'
import {
  Building2,
  CreditCard,
  ShieldCheck,
  Sun,
  Moon,
  LogOut,
  Activity,
} from 'lucide-react'
import { toast } from 'sonner'

interface AdminNavItem {
  id: string
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'admin-cabinets', label: 'Gestion des Cabinets', to: '/admin', icon: Building2 },
  { id: 'admin-abonnements', label: 'Abonnements & Licences', to: '/admin/abonnements', icon: CreditCard },
  { id: 'admin-audit', label: 'Conformité CNDP Loi 09-08', to: '/admin/audit', icon: ShieldCheck },
]

interface AdminLayoutProps {
  children?: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps = {}) {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.info('Session administrateur clôturée', {
      description: 'Déconnexion réussie.',
    })
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* SaaS Admin Topbar */}
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xs select-none">
        {/* Left: Brand & Admin Tag */}
        <div className="flex items-center gap-6">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-105">
              <DossiaLogo className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Dossia
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded font-medium">
              SAAS ADMIN
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive =
                item.to === '/admin'
                  ? location.pathname === '/admin' || location.pathname === '/admin/' || location.pathname === '/admin/cabinets'
                  : location.pathname.startsWith(item.to)

              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors
                    ${
                      isActive
                        ? 'bg-emerald-50/90 dark:bg-zinc-800 text-emerald-950 dark:text-zinc-100 font-semibold border border-emerald-200/80 dark:border-zinc-700 shadow-2xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/70 dark:hover:bg-zinc-900 border border-transparent'
                    }
                  `}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: Cloud Status, Theme Toggle, Admin Identity & Logout */}
        <div className="flex items-center gap-3">
          {/* Cloud Health Pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Activity className="w-3 h-3 text-zinc-400" />
            <span>Cloud Maroc Tier-3 · Opérationnel</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 stroke-[1.5]" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700 stroke-[1.5]" />
            )}
          </button>

          {/* Admin User Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {user ? `${user.firstName} ${user.lastName}` : 'Super Admin'}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                admin@dossia.ma
              </span>
            </div>

            <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200">
              SA
            </div>

            <button
              onClick={handleLogout}
              title="Se déconnecter"
              className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Viewport Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto overflow-y-auto flex flex-col">
        {children ? children : <Outlet />}
      </main>
    </div>
  )
}
