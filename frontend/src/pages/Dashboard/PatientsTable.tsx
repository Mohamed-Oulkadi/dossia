import { useState } from 'react'
import { usePatients, type Patient } from '@/hooks/use-patients'
import { PatientAmoModal } from '@/components/cnss/PatientAmoModal'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  UserPlus,
  Search,
  Phone,
  Calendar,
  CreditCard,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  FileCheck2,
  FolderLock,
} from 'lucide-react'
import { PatientDocumentVaultModal } from '@/components/vault/PatientDocumentVaultModal'

export function PatientsTable() {
  const { openModal } = useAppStore()
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatientForAmo, setSelectedPatientForAmo] = useState<Patient | null>(null)
  const [selectedPatientForVault, setSelectedPatientForVault] = useState<Patient | null>(null)

  const { data, isLoading, isError, error, refetch, isFetching } = usePatients(page, 20)

  // Filter clientside by search query if user types in search bar
  const filteredPatients = (data?.content ?? []).filter((patient) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      patient.firstName.toLowerCase().includes(q) ||
      patient.lastName.toLowerCase().includes(q) ||
      patient.cin.toLowerCase().includes(q) ||
      patient.phoneNumber.includes(q) ||
      (patient.cnssNumber && patient.cnssNumber.includes(q))
    )
  })

  const getInsuranceBadge = (type?: string | null) => {
    switch (type) {
      case 'CNSS':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            CNSS
          </span>
        )
      case 'AMO':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
            AMO
          </span>
        )
      case 'CNOPS':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
            CNOPS
          </span>
        )
      case 'Privé':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            Privé
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            {type || 'Aucune'}
          </span>
        )
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden select-none">
      {/* ── Action Toolbar ── */}
      <div className="h-12 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-slate-100/70 dark:bg-zinc-900/30">
        <div className="flex items-center gap-2.5">
          <div className="relative w-64 md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 stroke-[1.5]" />
            <Input
              type="text"
              placeholder="Rechercher par CIN, nom, téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 shadow-2xs"
            />
          </div>
          <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono hidden sm:inline">
            {data ? `${data.totalElements} patient(s)` : 'Chargement...'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 gap-1.5 text-xs text-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-800"
            title="Rafraîchir les dossiers"
          >
            <RefreshCw className={`w-3.5 h-3.5 stroke-[1.5] ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Actualiser</span>
          </Button>

          <Button
            size="sm"
            onClick={() => openModal('new-patient')}
            className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium border-0 cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Nouveau Patient</span>
            <kbd className="hidden md:inline-block ml-1 font-mono text-[9px] bg-emerald-700/60 px-1 rounded">
              Alt+P
            </kbd>
          </Button>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="flex-1 overflow-auto">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="p-4 space-y-2">
            <div className="h-8 bg-zinc-100 dark:bg-zinc-900/60 rounded animate-pulse" />
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/40 rounded flex items-center px-3 gap-4 animate-pulse"
              >
                <div className="w-16 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="w-40 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="w-28 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="w-24 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="w-20 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Impossible de charger la liste des patients
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                {error?.message || "Vérifiez que le backend Spring Boot est accessible sur http://localhost:8080."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5 stroke-[1.5]" />
              Réessayer
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredPatients.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 flex items-center justify-center">
              <FileText className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {searchQuery ? 'Aucun résultat pour cette recherche' : 'Aucun dossier patient enregistré'}
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                {searchQuery
                  ? 'Vérifiez l’orthographe du CIN ou du nom.'
                  : 'Commencez par ajouter votre premier patient pour initialiser la patientèle du cabinet.'}
              </p>
            </div>
            {!searchQuery && (
              <Button
                size="sm"
                onClick={() => openModal('new-patient')}
                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <UserPlus className="w-3.5 h-3.5 stroke-[1.5]" />
                Créer un dossier patient
              </Button>
            )}
          </div>
        )}

        {/* Loaded Data Table */}
        {!isLoading && !isError && filteredPatients.length > 0 && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-slate-100/70 dark:bg-zinc-900/60 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider select-none">
                <th className="py-2.5 px-3">CIN</th>
                <th className="py-2.5 px-3">Nom &amp; Prénom</th>
                <th className="py-2.5 px-3">Téléphone</th>
                <th className="py-2.5 px-3">Date de Naissance</th>
                <th className="py-2.5 px-3">Couverture</th>
                <th className="py-2.5 px-3">N° CNSS / Immat</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/70">
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="h-10 hover:bg-slate-50/90 dark:hover:bg-zinc-900/50 transition-colors group"
                >
                  {/* CIN */}
                  <td className="py-2 px-3 font-mono font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {patient.cin}
                  </td>

                  {/* Name */}
                  <td className="py-2 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {patient.lastName.toUpperCase()} {patient.firstName}
                  </td>

                  {/* Phone */}
                  <td className="py-2 px-3 font-mono tabular-nums text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-zinc-400 stroke-[1.5]" />
                      {patient.phoneNumber}
                    </span>
                  </td>

                  {/* Birth Date */}
                  <td className="py-2 px-3 font-mono tabular-nums text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-zinc-400 stroke-[1.5]" />
                      {patient.birthDate}
                    </span>
                  </td>

                  {/* Insurance */}
                  <td className="py-2 px-3">
                    {getInsuranceBadge(patient.mutuelleType)}
                  </td>

                  {/* CNSS */}
                  <td className="py-2 px-3 font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                    {patient.cnssNumber ? (
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-zinc-400 stroke-[1.5]" />
                        {patient.cnssNumber}
                      </span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPatientForVault(patient)}
                        className="h-6 px-2 text-[11px] gap-1 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer"
                        title="Coffre-Fort Documents & Imagerie"
                      >
                        <FolderLock className="w-3 h-3 stroke-[1.5]" />
                        <span>Documents</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPatientForAmo(patient)}
                        className="h-6 px-2 text-[11px] gap-1 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 cursor-pointer"
                        title="Dossier AMO & Feuilles de Soins"
                      >
                        <FileCheck2 className="w-3 h-3 stroke-[1.5]" />
                        <span>Dossier AMO</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => openModal('new-consultation')}
                        className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Consultation
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination Footer ── */}
      {data && data.totalPages > 1 && (
        <div className="h-10 px-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 bg-zinc-50/40 dark:bg-zinc-900/20">
          <span>
            Page <span className="font-mono text-zinc-900 dark:text-zinc-200">{data.number + 1}</span> sur{' '}
            <span className="font-mono">{data.totalPages}</span>
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={data.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="h-7 w-7 p-0 border-zinc-200 dark:border-zinc-800"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
              className="h-7 w-7 p-0 border-zinc-200 dark:border-zinc-800"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Patient AMO / Feuille de Soins Modal ── */}
      <PatientAmoModal
        patient={selectedPatientForAmo}
        isOpen={Boolean(selectedPatientForAmo)}
        onClose={() => setSelectedPatientForAmo(null)}
      />

      {/* ── Patient Documents Vault Modal ── */}
      <PatientDocumentVaultModal
        patient={selectedPatientForVault}
        isOpen={Boolean(selectedPatientForVault)}
        onClose={() => setSelectedPatientForVault(null)}
      />
    </div>
  )
}
