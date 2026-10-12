import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, type UserRole } from '@/store/useAuthStore'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { role, user } = useAuthStore()

  if (!role || !allowedRoles.includes(role)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-6 h-6 stroke-[1.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Accès Restreint — CNDP Loi 09-08
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Le dossier médical, les diagnostics cliniques et les ordonnances sont strictement réservés au corps médical habilité (Médecin traitant).
            </p>
          </div>

          <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
            <span>Rôle actif : <strong className="text-zinc-900 dark:text-zinc-200">{role || 'NON DÉFINI'}</strong></span>
            <span>Utilisateur : {user ? `${user.firstName} ${user.lastName}` : 'Inconnu'}</span>
          </div>

          <Link
            to="/app"
            className="inline-flex items-center justify-center gap-2 w-full h-8 px-3 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            Retourner à l’Agenda
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
