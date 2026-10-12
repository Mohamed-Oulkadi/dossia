import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { CommandPalette } from '@/pages/Dashboard/CommandPalette'
import { ActionModals } from '@/components/modals/ActionModals'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Search, Sun, Moon, LogOut } from 'lucide-react'
import { toast } from 'sonner'

interface ClinicLayoutProps {
  children?: React.ReactNode
}

export function ClinicLayout({ children }: ClinicLayoutProps) {
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
    ? role === 'DOCTOR'
      ? `Dr. ${user.firstName} ${user.lastName}`
      : `${user.firstName} ${user.lastName}`
    : 'Dr. Rachid Amrani'

  const roleLabel =
    role === 'DOCTOR'
      ? 'Médecin Praticien'
      : role === 'SECRETARY'
      ? 'Secrétaire Médicale'
      : 'Super Admin'

  const initials = user
    ? `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase()
    : 'RA'

  const clinicName = user?.clinicName || 'Clinique Ibn Sina Agadir'

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors">
      {/* Collapsible Role-Aware Sidebar */}
      <Sidebar />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="
          flex-shrink-0 h-12 flex items-center justify-between
          px-4 border-b border-zinc-200 dark:border-zinc-800
          bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xs select-none transition-colors
        ">
          {/* Command Palette Trigger */}
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

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
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

            {/* Authenticated User Identity */}
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

            {/* User Avatar Initials */}
            <div className="
              w-7 h-7 rounded-md flex items-center justify-center text-xs
              bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
              text-zinc-800 dark:text-zinc-200 font-mono font-medium
            ">
              {initials}
            </div>

            {/* Logout Action */}
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

        {/* Content Outlet or Children */}
        <main className="flex-1 overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-950">
          {children ? children : <Outlet />}
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <CommandPalette />
      <ActionModals />
    </div>
  )
}
