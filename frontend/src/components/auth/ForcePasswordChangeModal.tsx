import React, { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldAlert, Check, X, Lock, KeyRound, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export const ForcePasswordChangeModal: React.FC = () => {
  const { user, setUser } = useAuthStore()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only render if user is flagged with passwordChangeRequired
  if (!user?.passwordChangeRequired) {
    return null
  }

  const hasMinLength = newPassword.length >= 12
  const hasUpper = /[A-Z]/.test(newPassword)
  const hasLower = /[a-z]/.test(newPassword)
  const hasDigit = /\d/.test(newPassword)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword
  const isDifferentFromCurrent = newPassword !== currentPassword

  const isValid =
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasDigit &&
    hasSpecial &&
    passwordsMatch &&
    isDifferentFromCurrent &&
    currentPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      })

      if (res.data?.user) {
        setUser(res.data.user)
      } else {
        // Fallback update
        setUser({ ...user, passwordChangeRequired: false })
      }

      toast.success('Mot de passe mis à jour', {
        description: 'Votre mot de passe a été sécurisé selon la norme CNDP Loi 09-08.',
      })
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string; message?: string } } }
      const message =
        errorObj?.response?.data?.detail ||
        errorObj?.response?.data?.message ||
        'Impossible de modifier le mot de passe. Veuillez vérifier vos identifiants.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 text-zinc-900 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-base leading-tight">Changement de mot de passe obligatoire</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Conformité CNDP Loi 09-08 — Premier accès cabinet
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">
          Votre compte a été initialisé avec un mot de passe temporaire. Vous devez obligatoirement définir un mot de
          passe fort avant de pouvoir accéder aux dossiers médicaux et aux données patients.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Mot de passe temporaire actuel
            </label>
            <div className="relative">
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Entrez votre mot de passe temporaire"
                required
                className="pr-10 text-xs font-mono"
              />
              <KeyRound className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nouveau mot de passe permanent
            </label>
            <div className="relative">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="12 caractères minimum"
                required
                className="pr-10 text-xs font-mono"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Répétez le nouveau mot de passe"
              required
              className="text-xs font-mono"
            />
          </div>

          {/* Complexity indicators */}
          <div className="bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-1.5 font-mono">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 font-sans">
              Exigences de sécurité CNDP
            </div>
            <div className="flex items-center gap-2">
              {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-zinc-400" />}
              <span className={hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}>
                Au moins 12 caractères
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasUpper && hasLower ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-zinc-400" />}
              <span className={hasUpper && hasLower ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}>
                Lettres majuscules & minuscules
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasDigit ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-zinc-400" />}
              <span className={hasDigit ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}>
                Au moins un chiffre (0-9)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-zinc-400" />}
              <span className={hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}>
                Au moins un symbole spécial (!@#$...)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {passwordsMatch ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-zinc-400" />}
              <span className={passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}>
                Les deux mots de passe correspondent
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isValid || loading}
            className="w-full h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Mise à jour en cours...
              </>
            ) : (
              'Valider et sécuriser mon compte'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
