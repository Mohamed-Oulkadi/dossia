import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { FileQuestion, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { role, isAuthenticated } = useAuthStore()

  const destination = !isAuthenticated
    ? '/'
    : role === 'SUPER_ADMIN'
    ? '/admin'
    : '/app'

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs text-center space-y-4">
        {/* Icon */}
        <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500">
          <FileQuestion className="w-6 h-6 stroke-[1.5]" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            ERREUR 404
          </div>
          <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Page Introuvable
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            La ressource demandée n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        {/* CTA */}
        <Button
          onClick={() => navigate(destination, { replace: true })}
          className="w-full h-8 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retourner à l&apos;accueil
        </Button>
      </div>
    </div>
  )
}
export default NotFoundPage
