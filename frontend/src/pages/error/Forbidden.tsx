import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const { role, user } = useAuthStore()

  const destination = role === 'SUPER_ADMIN' ? '/admin' : '/app'

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs text-center space-y-4">
        {/* Shield Icon */}
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <ShieldAlert className="w-6 h-6 stroke-[1.5]" />
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Lock className="w-3 h-3" />
            ERREUR 403 · ACCÈS RESTREINT
          </div>
          <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Conformité CNDP Loi 09-08
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Le dossier médical, les diagnostics cliniques et les ordonnances sont strictement réservés au corps médical habilité (Médecin traitant).
          </p>
        </div>

        {/* Identity Details Card */}
        <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 text-left space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Rôle actif :</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">{role || 'NON AUTHENTIFIÉ'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Utilisateur :</span>
            <span className="text-zinc-900 dark:text-zinc-200">{user ? `${user.firstName} ${user.lastName}` : 'Inconnu'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Cabinet :</span>
            <span className="text-zinc-900 dark:text-zinc-200">{user?.clinicName || 'Tenant Maroc'}</span>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={() => navigate(destination, { replace: true })}
          className="w-full h-8 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retourner à l&apos;espace de travail
        </Button>
      </div>
    </div>
  )
}
export default ForbiddenPage
