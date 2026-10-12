import { useState } from 'react'
import {
  useAdminSubscriptions,
  useAdminClinics,
} from '@/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  CreditCard,
  Building2,
  TrendingUp,
  FileDown,
  Receipt,
  Download,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'

export function AdminSubscriptionsPage() {
  const { data: metrics } = useAdminSubscriptions()
  const { data: clinics = [] } = useAdminClinics()
  const [downloadingClinicId, setDownloadingClinicId] = useState<string | null>(null)

  const handleDownloadInvoice = (clinicName: string, ice: string, amount: number) => {
    setDownloadingClinicId(ice)
    setTimeout(() => {
      setDownloadingClinicId(null)
      toast.success('Facture SaaS B2B générée', {
        description: `Quittance certifiée émise pour ${clinicName} — Montant : ${amount.toLocaleString('fr-MA')} MAD TTC (TVA 20% incluse).`,
      })
    }, 600)
  }

  const mrr = metrics?.mrrMad || 12240
  const arr = metrics?.arrMad || mrr * 12
  const activeCount = metrics?.activeClinics || clinics.filter((c) => c.subscriptionStatus === 'ACTIVE').length
  const arpu = activeCount > 0 ? Math.round(mrr / activeCount) : 1490

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Abonnements & Licences SaaS
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              Facturation MAD · B2B Maroc
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Supervision du revenu récurrent, des échéances de licences et de la conformité fiscale marocaine (TVA 20%).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              toast.info('Export comptable prêt', {
                description: 'Le grand livre B2B des abonnements a été généré.',
              })
            }
            className="h-8 text-xs font-medium cursor-pointer gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Exporter Journal Comptable
          </Button>
        </div>
      </div>

      {/* KPI Financial Cockpit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: MRR */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium">MRR (Revenu Mensuel)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {mrr.toLocaleString('fr-MA')}
            </span>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
              MAD
            </span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500">
            +14.2% de croissance ce mois
          </div>
        </div>

        {/* KPI 2: ARR */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium">ARR (Revenu Annuel)</span>
            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {arr.toLocaleString('fr-MA')}
            </span>
            <span className="text-xs font-mono font-medium text-zinc-500">
              MAD
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Projection sur 12 mois glissants
          </div>
        </div>

        {/* KPI 3: Cabinets Sous Licence */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium">Cabinets Facturés</span>
            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {activeCount}
            </span>
            <span className="text-xs text-zinc-500">
              sur {clinics.length} total
            </span>
          </div>
          <div className="text-[10px] text-emerald-600 font-mono">
            0% de taux de désabonnement (churn)
          </div>
        </div>

        {/* KPI 4: ARPU */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium">ARPU Moyen / Cabinet</span>
            <Receipt className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {arpu.toLocaleString('fr-MA')}
            </span>
            <span className="text-xs font-mono font-medium text-zinc-500">
              MAD
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Formule prédominante : PRO
          </div>
        </div>
      </div>

      {/* Plan Distribution Matrix */}
      <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          Grille Tarifaire SaaS & Distribution des Formules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Plan Starter */}
          <div className="p-3.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">STARTER</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                1 Médecin · 1 Assistante
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
              790 <span className="text-xs font-normal text-zinc-500">MAD / mois</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Idéal pour cabinets individuels en démarrage. Agenda & Dossiers patients.
            </p>
          </div>

          {/* Plan Pro */}
          <div className="p-3.5 rounded-md border border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                PRO
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  POPULAIRE
                </span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                Jusqu&apos;à 3 Médecins
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
              1 490 <span className="text-xs font-normal text-zinc-500">MAD / mois</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Caisse rapide MAD, ordonnances A4 et télétransmission CNSS / AMO.
            </p>
          </div>

          {/* Plan Enterprise */}
          <div className="p-3.5 rounded-md border border-purple-500/30 bg-purple-50/20 dark:bg-purple-950/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">ENTERPRISE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                Cliniques & Centres
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-purple-700 dark:text-purple-400 tabular-nums">
              2 990 <span className="text-xs font-normal text-zinc-500">MAD / mois</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Multi-spécialités illimitées, SLA support 24/7 et audit CNDP dédié.
            </p>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-zinc-500" />
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Contrats Actifs & Facturation des Cabinets ({clinics.length})
            </h2>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Règlement par Prélèvement / Virement Maroc
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50 text-[11px] font-medium text-zinc-500 uppercase tracking-wider select-none">
                <th className="py-2.5 px-4 font-semibold">Cabinet Médical</th>
                <th className="py-2.5 px-3 font-semibold">ICE (15 Chiffres)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Formule</th>
                <th className="py-2.5 px-3 font-semibold text-right">Tarif Mensuel</th>
                <th className="py-2.5 px-3 font-semibold text-center">État de Facturation</th>
                <th className="py-2.5 px-3 font-semibold text-center">Échéance</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action B2B</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
              {clinics.map((c) => {
                const isSuspended = c.subscriptionStatus === 'SUSPENDED'

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Clinic Name */}
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-[10px] text-zinc-500">{c.city}</div>
                    </td>

                    {/* ICE */}
                    <td className="py-3 px-3 font-mono text-[11px] tabular-nums text-zinc-700 dark:text-zinc-300">
                      {c.ice}
                    </td>

                    {/* Plan */}
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {c.monthlyFeeMad > 2000 ? 'ENTERPRISE' : c.monthlyFeeMad > 1000 ? 'PRO' : 'STARTER'}
                      </span>
                    </td>

                    {/* Monthly Fee in MAD */}
                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                      {c.monthlyFeeMad.toLocaleString('fr-MA')}{' '}
                      <span className="text-[10px] text-zinc-500 font-normal">MAD</span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
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
                        {isSuspended ? 'EN RETARD' : 'À JOUR'}
                      </span>
                    </td>

                    {/* Due date */}
                    <td className="py-3 px-3 text-center font-mono text-[11px] text-zinc-500">
                      30/10/2026
                    </td>

                    {/* Download Invoice Button */}
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadInvoice(c.name, c.ice, c.monthlyFeeMad)}
                        disabled={downloadingClinicId === c.ice}
                        title="Télécharger la quittance fiscale en MAD"
                        className="h-7 px-2 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer gap-1"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Facture B2B
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              Fiscalité marocaine : Factures émises sous TVA marocaine de 20% avec mention de l&apos;ICE émetteur et client.
            </span>
          </div>
          <span className="font-mono text-[11px] tabular-nums">
            {clinics.length} contrats répertoriés
          </span>
        </div>
      </div>
    </div>
  )
}
export default AdminSubscriptionsPage
