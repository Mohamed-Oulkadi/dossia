import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Users,
  CreditCard,
  Plus,
  Search,
  ShieldCheck,
  RefreshCw,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NewClinicModal, type ClinicRecord } from './NewClinicModal'
import {
  useAdminClinics,
  useAdminSubscriptions,
  useToggleClinicStatus,
} from '@/hooks/use-admin'

export function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL')
  const [isNewClinicOpen, setIsNewClinicOpen] = useState(false)

  const { data: clinics = [], isLoading } = useAdminClinics({
    search: searchQuery,
    status: statusFilter,
  })
  const { data: metrics } = useAdminSubscriptions()
  const toggleStatusMutation = useToggleClinicStatus()

  // Calculations
  const totalClinics = metrics?.totalClinics || clinics.length
  const activeClinics =
    metrics?.activeClinics || clinics.filter((c) => c.subscriptionStatus === 'ACTIVE').length
  const totalDoctors =
    metrics?.totalDoctors || clinics.reduce((acc, c) => acc + (c.doctorCount || 1), 0)
  const totalSecretaries =
    metrics?.totalSecretaries || clinics.reduce((acc, c) => acc + (c.secretaryCount || 0), 0)
  const mrrMAD =
    metrics?.mrrMad ||
    clinics
      .filter((c) => c.subscriptionStatus === 'ACTIVE')
      .reduce((acc, c) => acc + (c.monthlyFeeMad || 1490), 0)

  const toggleClinicStatus = (id: string, currentStatus: string) => {
    toggleStatusMutation.mutate({
      clinicId: id,
      status: currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
    })
  }

  const handleClinicCreated = (_newClinic: ClinicRecord) => {
    // TanStack Query invalidates cache automatically on mutation success
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Gestion des Cabinets Médicaux
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              Multi-Tenancy Maroc
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Supervision des tenants isolés, quotas de licences et isolation stricte CNDP Loi 09-08.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsNewClinicOpen(true)}
            size="sm"
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer shadow-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2]" />
            Nouveau Cabinet
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Cabinets */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Cabinets Médicaux</span>
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {totalClinics}
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              {activeClinics} actifs
            </span>
          </div>
        </div>

        {/* KPI 2: Médecins */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Praticiens Traitants</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {totalDoctors}
            </span>
            <span className="text-[11px] text-zinc-500">
              comptes médecins
            </span>
          </div>
        </div>

        {/* KPI 3: Secrétaires */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Secrétaires Médicales</span>
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {totalSecretaries}
            </span>
            <span className="text-[11px] text-zinc-500">
              assistantes
            </span>
          </div>
        </div>

        {/* KPI 4: MRR in MAD */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">MRR Récurrent</span>
            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {mrrMAD.toLocaleString('fr-MA')}
            </span>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
              MAD / mois
            </span>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs overflow-hidden flex flex-col">
        {/* Table Filters Toolbar */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, ville, ICE ou médecin…"
              className="h-8 pl-8 text-xs font-sans"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Tous ({clinics.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Actifs ({activeClinics})
            </button>
            <button
              onClick={() => setStatusFilter('SUSPENDED')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'SUSPENDED'
                  ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Suspendus ({clinics.length - activeClinics})
            </button>
          </div>
        </div>

        {/* High Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-950/50 text-[11px] font-medium text-zinc-500 uppercase tracking-wider select-none">
                <th className="py-2.5 px-4 font-semibold">Cabinet & Ville</th>
                <th className="py-2.5 px-3 font-semibold">ICE (15 Chiffres)</th>
                <th className="py-2.5 px-3 font-semibold">Praticien Référent</th>
                <th className="py-2.5 px-3 font-semibold text-center">Utilisateurs</th>
                <th className="py-2.5 px-3 font-semibold text-center">Formule</th>
                <th className="py-2.5 px-3 font-semibold text-right">Tarif / Mois</th>
                <th className="py-2.5 px-3 font-semibold text-center">Statut</th>
                <th className="py-2.5 px-3 font-semibold text-center">Création</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-zinc-500 text-xs font-mono">
                    Chargement des cabinets…
                  </td>
                </tr>
              ) : clinics.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-zinc-500 text-xs">
                    Aucun cabinet médical ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                clinics.map((clinic) => {
                  const isSuspended = clinic.subscriptionStatus === 'SUSPENDED'

                  return (
                    <tr
                      key={clinic.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      {/* Name & City */}
                      <td className="py-2.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                            <Building2 className="w-3.5 h-3.5 stroke-[1.5]" />
                          </div>
                          <div>
                            <Link
                              to={`/admin/cabinets/${clinic.id}`}
                              className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                              {clinic.name}
                            </Link>
                            <div className="text-[10px] text-zinc-500">{clinic.city}</div>
                          </div>
                        </div>
                      </td>

                      {/* ICE */}
                      <td className="py-2.5 px-3 font-mono text-[11px] tabular-nums text-zinc-700 dark:text-zinc-300">
                        {clinic.ice}
                      </td>

                      {/* Lead Doctor */}
                      <td className="py-2.5 px-3">
                        <div className="text-zinc-900 dark:text-zinc-200 font-medium">
                          {clinic.leadDoctorName}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500">
                          {clinic.leadDoctorEmail}
                        </div>
                      </td>

                      {/* User count */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                          <span>{clinic.doctorCount || 1} Dr</span>
                          <span className="text-zinc-400">·</span>
                          <span>{clinic.secretaryCount || 0} Sec</span>
                        </span>
                      </td>

                      {/* Subscription Plan */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-medium border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                          {clinic.monthlyFeeMad > 2000 ? 'ENTERPRISE' : 'PRO'}
                        </span>
                      </td>

                      {/* Monthly Fee in MAD */}
                      <td className="py-2.5 px-3 text-right font-mono font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                        {clinic.monthlyFeeMad.toLocaleString('fr-MA')}{' '}
                        <span className="text-[10px] text-zinc-500 font-normal">MAD</span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
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
                      </td>

                      {/* Creation Date */}
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] tabular-nums text-zinc-500">
                        {new Date(clinic.createdAt).toLocaleDateString('fr-MA', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manage Link */}
                          <Link
                            to={`/admin/cabinets/${clinic.id}`}
                            title="Gérer la fiche du cabinet et ses utilisateurs"
                            className="p-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
                          </Link>

                          {/* Toggle Status */}
                          <button
                            onClick={() => toggleClinicStatus(clinic.id, clinic.subscriptionStatus)}
                            title={isSuspended ? 'Réactiver le cabinet' : 'Suspendre le cabinet'}
                            className={`p-1 rounded border text-[11px] transition-colors cursor-pointer ${
                              isSuspended
                                ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-amber-600 hover:border-amber-500/30 dark:hover:bg-amber-950/20'
                            }`}
                          >
                            <RefreshCw className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              Isolation multi-tenant vérifiée : Données cliniques cloisonnées selon la directive CNDP.
            </span>
          </div>
          <span className="font-mono text-[11px] tabular-nums">
            {clinics.length} cabinets répertoriés
          </span>
        </div>
      </div>

      {/* New Clinic Provisioning Modal */}
      <NewClinicModal
        open={isNewClinicOpen}
        onOpenChange={setIsNewClinicOpen}
        onClinicCreated={handleClinicCreated}
      />
    </div>
  )
}
export default AdminDashboard
