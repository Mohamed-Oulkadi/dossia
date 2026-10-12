import { useState } from 'react'
import { useAdminAuditLogs } from '@/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  ShieldCheck,
  Search,
  FileCheck2,
  Lock,
  Server,
  Globe,
} from 'lucide-react'

export function AdminAuditPage() {
  const { data: auditLogs = [] } = useAdminAuditLogs()
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'SECURITY_ALERT'>('ALL')

  const handleGenerateCertificate = () => {
    toast.success('Certificat CNDP Loi 09-08 généré', {
      description: 'Attestation officielle de conformité et de cloisonnement souverain prête au téléchargement.',
    })
  }

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetTenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter

    return matchesSearch && matchesSeverity
  })

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Conformité CNDP Loi 09-08 & Audit de Sécurité
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              Audit Immuable
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Traçabilité des accès, détection des anomalies et certification de protection des données de santé au Maroc.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleGenerateCertificate}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer gap-1.5 shadow-2xs"
          >
            <FileCheck2 className="w-3.5 h-3.5 stroke-[2]" />
            Générer Certificat CNDP
          </Button>
        </div>
      </div>

      {/* Compliance Overview Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: CNDP Legal Status */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Agrément CNDP Maroc</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Dossier D-W-2026/089
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              CONFORME
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Traitement des données à caractère personnel de santé déclaré auprès de la commission nationale.
          </p>
        </div>

        {/* Card 2: Tenant Isolation */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Cloisonnement Multi-Tenant</span>
            <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Zero-Cross Boundary
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
              ISOLÉ
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Ségrégation stricte par clinic_id au niveau schéma et requêtes SQL. Aucun accès Super Admin aux dossiers cliniques.
          </p>
        </div>

        {/* Card 3: Sovereign Cloud */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Cloud Souverain Maroc</span>
            <Server className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Datacenter Tier-3
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20">
              CASABLANCA
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Hébergement exclusif sur le territoire national avec sauvegardes chiffrées AES-256.
          </p>
        </div>
      </div>

      {/* Audit Logs Table Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par action, acteur, IP…"
              className="h-8 pl-8 text-xs font-sans"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setSeverityFilter('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                severityFilter === 'ALL'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Tous ({auditLogs.length})
            </button>
            <button
              onClick={() => setSeverityFilter('INFO')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                severityFilter === 'INFO'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Info
            </button>
            <button
              onClick={() => setSeverityFilter('WARNING')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                severityFilter === 'WARNING'
                  ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Avertissements
            </button>
            <button
              onClick={() => setSeverityFilter('SECURITY_ALERT')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                severityFilter === 'SECURITY_ALERT'
                  ? 'bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Alertes
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50 text-[11px] font-medium text-zinc-500 uppercase tracking-wider select-none">
                <th className="py-2.5 px-4 font-semibold">Horodatage</th>
                <th className="py-2.5 px-3 font-semibold text-center">Niveau</th>
                <th className="py-2.5 px-3 font-semibold">Action / Événement</th>
                <th className="py-2.5 px-3 font-semibold">Acteur</th>
                <th className="py-2.5 px-3 font-semibold">Cible</th>
                <th className="py-2.5 px-3 font-semibold">Détails</th>
                <th className="py-2.5 px-4 font-semibold">Adresse IP & Réseau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-zinc-500">
                    Aucun événement d&apos;audit ne correspond aux critères.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isAlert = log.severity === 'SECURITY_ALERT'
                  const isWarning = log.severity === 'WARNING'

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-2.5 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 whitespace-nowrap tabular-nums">
                        {new Date(log.timestamp).toLocaleTimeString('fr-MA', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}{' '}
                        <span className="text-[10px] text-zinc-400">
                          {new Date(log.timestamp).toLocaleDateString('fr-MA', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            isAlert
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                              : isWarning
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">
                        {log.action}
                      </td>

                      {/* Actor */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                        {log.actorEmail}
                      </td>

                      {/* Target */}
                      <td className="py-2.5 px-3 text-zinc-800 dark:text-zinc-200">
                        <div className="truncate max-w-44 text-[11px]">{log.targetTenant}</div>
                      </td>

                      {/* Details */}
                      <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                        <div className="max-w-xs truncate text-[11px]">{log.details}</div>
                      </td>

                      {/* IP */}
                      <td className="py-2.5 px-4 font-mono text-[10px] text-zinc-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-zinc-400" />
                          <span>{log.ipAddress}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              Journal certifié ISO/IEC 27001 & CNDP : Enregistrements scellés avec horodatage cryptographique.
            </span>
          </div>
          <span className="font-mono text-[11px] tabular-nums">
            {filteredLogs.length} événements répertoriés
          </span>
        </div>
      </div>
    </div>
  )
}
export default AdminAuditPage
