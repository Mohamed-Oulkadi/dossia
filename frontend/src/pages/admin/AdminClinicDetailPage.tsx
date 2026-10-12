import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  useAdminClinicDetails,
  useToggleClinicStatus,
  useResetUserPassword,
} from '@/hooks/use-admin'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Users,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  Mail,
  CreditCard,
  Lock,
} from 'lucide-react'

export function AdminClinicDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: clinic, isLoading } = useAdminClinicDetails(id)
  const toggleStatusMutation = useToggleClinicStatus()
  const resetPasswordMutation = useResetUserPassword()

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-xs font-mono text-zinc-500">
        Chargement de la fiche cabinet…
      </div>
    )
  }

  if (!clinic) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
        <div className="text-xs text-zinc-500">Cabinet médical introuvable.</div>
        <Button size="sm" onClick={() => navigate('/admin')} className="text-xs">
          Retourner aux cabinets
        </Button>
      </div>
    )
  }

  const isSuspended = clinic.subscriptionStatus === 'SUSPENDED'

  const handleToggleStatus = () => {
    toggleStatusMutation.mutate({
      clinicId: clinic.id,
      status: isSuspended ? 'ACTIVE' : 'SUSPENDED',
    })
  }

  const handleResetPassword = (userId: string) => {
    resetPasswordMutation.mutate({ clinicId: clinic.id, userId })
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 space-y-6">
      {/* Back Button & Header */}
      <div className="space-y-3">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à la gestion des cabinets</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <Building2 className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {clinic.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isSuspended
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSuspended ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  {isSuspended ? 'SUSPENDU' : 'ACTIF'}
                </span>
              </div>
              <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5 font-mono">
                <span>ICE : {clinic.ice}</span>
                <span>·</span>
                <span>{clinic.city}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isSuspended ? 'default' : 'outline'}
              onClick={handleToggleStatus}
              disabled={toggleStatusMutation.isPending}
              className={`h-8 text-xs font-medium cursor-pointer gap-1.5 ${
                isSuspended
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 border-amber-500/30'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[1.5]" />
              {isSuspended ? 'Réactiver le cabinet' : 'Suspendre le cabinet'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Fiche Juridique & Licence */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Données Légales */}
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-zinc-400" />
              Identité Fiscale & Tenant
            </h3>

            <div className="space-y-2 text-xs divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-500">Raison Sociale</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{clinic.name}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 font-mono text-[11px]">
                <span className="text-zinc-500">ICE (Maroc)</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {clinic.ice}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-500">Ville</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{clinic.city}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 font-mono text-[11px]">
                <span className="text-zinc-500">Date d&apos;adhésion</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {new Date(clinic.createdAt).toLocaleDateString('fr-MA', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Formule SaaS */}
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
              Abonnement & Licences
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Formule Active</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {clinic.plan}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-zinc-500">Tarif Récurrent</span>
                <span className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {clinic.monthlyFeeMad.toLocaleString('fr-MA')}{' '}
                  <span className="text-xs text-zinc-500 font-normal">MAD / mois</span>
                </span>
              </div>

              <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 text-[11px] text-zinc-500">
                Paiement mensuel par prélèvement bancaire automatique (RIB Maroc).
              </div>
            </div>
          </div>

          {/* Card 3: CNDP Loi 09-08 Shield */}
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
              <span className="text-xs font-semibold">Isolation CNDP Certifiée</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Le tenant est cloisonné par <code className="font-mono text-zinc-700 dark:text-zinc-300">clinic_id</code>. Aucun autre cabinet ni le Super Admin ne peut accéder aux dossiers cliniques ni aux antécédents médicaux de cette patientèle.
            </p>
          </div>
        </div>

        {/* Right Column (8 cols): Utilisateurs & Collaborateurs */}
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/40">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-500" />
              <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Utilisateurs Rattachés au Cabinet ({clinic.users.length})
              </h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Comptes Médecins et Secrétariat
            </span>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50 text-[11px] font-medium text-zinc-500 uppercase tracking-wider select-none">
                  <th className="py-2.5 px-4 font-semibold">Collaborateur</th>
                  <th className="py-2.5 px-3 font-semibold">Email de Connexion</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Rôle Système</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Statut</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
                {clinic.users.map((u) => {
                  const isDoctor = u.role === 'DOCTOR'

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Name */}
                      <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-semibold border ${
                              isDoctor
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            }`}
                          >
                            {u.firstName[0]}
                            {u.lastName[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {isDoctor ? `Dr. ${u.firstName} ${u.lastName}` : `${u.firstName} ${u.lastName}`}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono">ID: {u.id.slice(0, 8)}…</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-3 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-zinc-400" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium border ${
                            isDoctor
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          }`}
                        >
                          {isDoctor ? 'MÉDECIN PRATICIEN' : 'SECRÉTAIRE MÉDICALE'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          ACTIF
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPassword(u.id)}
                          disabled={resetPasswordMutation.isPending}
                          title="Réinitialiser le mot de passe sur Dossia2026!"
                          className="h-7 px-2 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer gap-1"
                        >
                          <KeyRound className="w-3 h-3" />
                          Reset MDP
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                Politique de mot de passe : Tout reset génère un mot de passe temporaire chiffré BCrypt.
              </span>
            </div>
            <span className="font-mono text-[11px]">{clinic.users.length} comptes actifs</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminClinicDetailPage
