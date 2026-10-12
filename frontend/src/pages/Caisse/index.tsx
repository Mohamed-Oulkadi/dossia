import { useState } from 'react'
import {
  useDailyLedger,
  downloadReceiptPdf,
  formatMAD,
  type PaymentMethod,
} from '@/hooks/use-billing'
import { PaymentModal } from '@/components/billing/PaymentModal'
import { Button } from '@/components/ui/button'
import {
  Banknote,
  CreditCard,
  FileText,
  Building,
  Printer,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
  FileDown,
  Loader2,
} from 'lucide-react'

export default function CaissePage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const { data: ledger, isLoading, refetch } = useDailyLedger(selectedDate)

  const handlePrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  const handlePrintJournal = () => {
    window.print()
  }

  const handleDownloadReceipt = async (invoiceId: string) => {
    setDownloadingId(invoiceId)
    try {
      await downloadReceiptPdf(invoiceId, true)
    } finally {
      setDownloadingId(null)
    }
  }

  const summary = ledger?.summary || {
    date: selectedDate,
    totalCash: 0,
    totalTpe: 0,
    totalCheck: 0,
    totalTransfer: 0,
    totalGlobal: 0,
    transactionCount: 0,
  }

  const transactions = ledger?.transactions || []

  const formattedDisplayDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(selectedDate + 'T12:00:00'))

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50/60 dark:bg-zinc-950/60 overflow-y-auto">
      {/* ── Top Header Bar ── */}
      <div className="flex-shrink-0 px-6 py-4 bg-white dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Receipt className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Caisse Journalière
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                Loi 09-08
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5 capitalize">
              {formattedDisplayDate}
            </p>
          </div>

          {/* Action CTAs & Date Controls */}
          <div className="flex items-center flex-wrap gap-2 print:hidden">
            {/* Date Navigator */}
            <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5 shadow-2xs">
              <button
                onClick={handlePrevDay}
                title="Jour précédent"
                className="w-7 h-7 flex items-center justify-center rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>

              <button
                onClick={handleToday}
                className="px-2 h-7 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xs cursor-pointer"
              >
                Aujourd'hui
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-7 px-1.5 text-xs font-mono bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
              />

              <button
                onClick={handleNextDay}
                title="Jour suivant"
                className="w-7 h-7 flex items-center justify-center rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </div>

            {/* Print Journal Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintJournal}
              className="h-8 text-xs cursor-pointer border-zinc-200 dark:border-zinc-800"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 stroke-[1.5]" />
              Imprimer Journal de Caisse
            </Button>

            {/* New Encaissement Button */}
            <Button
              size="sm"
              onClick={() => setIsPaymentModalOpen(true)}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5 stroke-[2]" />
              Nouvel Encaissement
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* ── 3 Distinct Top Metric Cards (Skills 01-premium-ui-craft: subtle borders, no heavy shadows) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Total Espèces */}
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Total Espèces (MAD)
              </span>
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Banknote className="w-3.5 h-3.5 stroke-[1.5]" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatMAD(summary.totalCash)}
              </span>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                Caisse physique
              </span>
            </div>
          </div>

          {/* Card 2: Total TPE */}
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Total TPE (MAD)
              </span>
              <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 stroke-[1.5]" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatMAD(summary.totalTpe)}
              </span>
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                Cartes bancaires
              </span>
            </div>
          </div>

          {/* Card 3: Total Chèques */}
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Total Chèques (MAD)
              </span>
              <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 stroke-[1.5]" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatMAD(summary.totalCheck)}
              </span>
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                À déposer
              </span>
            </div>
          </div>

          {/* Card 4: Total Global (Summary) */}
          <div className="p-4 rounded-lg bg-zinc-900 text-white dark:bg-zinc-900/90 border border-zinc-800 shadow-2xs">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Recette Globale (MAD)
              </span>
              <div className="w-6 h-6 rounded-md bg-white/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 stroke-[1.5]" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-white">
                {formatMAD(summary.totalGlobal)}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 tabular-nums">
                {summary.transactionCount} acte{summary.transactionCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* ── Clôture de Caisse (End-of-day Journal Table) ── */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Journal des Encaissements & Clôture
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {transactions.length} opération{transactions.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="text-[11px] text-zinc-500 font-mono">
              Casablanca Time (UTC+1)
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>Chargement du journal de caisse...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-500 space-y-3">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
                <Receipt className="w-5 h-5 stroke-[1.5]" />
              </div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">
                Aucun encaissement enregistré pour le {selectedDate}
              </p>
              <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                Les règlements effectués au comptoir apparaîtront automatiquement ici avec leur ventilation par mode de paiement.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaymentModalOpen(true)}
                className="h-8 text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Encaisser le premier acte
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    <th className="py-2.5 px-4 font-medium">Heure</th>
                    <th className="py-2.5 px-4 font-medium">Patient</th>
                    <th className="py-2.5 px-4 font-medium">CIN</th>
                    <th className="py-2.5 px-4 font-medium">Mode de Règlement</th>
                    <th className="py-2.5 px-4 font-medium">Référence / Chèque</th>
                    <th className="py-2.5 px-4 font-medium text-right">Montant (MAD)</th>
                    <th className="py-2.5 px-4 font-medium text-right print:hidden">Reçu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                  {transactions.map((tx) => {
                    const timeStr = new Date(tx.paymentDate).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })

                    return (
                      <tr
                        key={tx.paymentId}
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        {/* Heure */}
                        <td className="py-2.5 px-4 font-mono text-zinc-500 tabular-nums">
                          {timeStr}
                        </td>

                        {/* Patient */}
                        <td className="py-2.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                          {tx.patientName}
                        </td>

                        {/* CIN */}
                        <td className="py-2.5 px-4 font-mono text-zinc-500 text-[11px]">
                          {tx.cin || '-'}
                        </td>

                        {/* Mode */}
                        <td className="py-2.5 px-4">
                          <PaymentBadge method={tx.paymentMethod} />
                        </td>

                        {/* Réf */}
                        <td className="py-2.5 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                          {tx.referenceNumber || '-'}
                        </td>

                        {/* Montant */}
                        <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                          {formatMAD(tx.amount)}
                        </td>

                        {/* Action Reçu */}
                        <td className="py-2.5 px-4 text-right print:hidden">
                          <button
                            onClick={() => handleDownloadReceipt(tx.invoiceId)}
                            disabled={downloadingId === tx.invoiceId}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer disabled:opacity-50"
                            title="Télécharger Reçu Note d'Honoraires PDF"
                          >
                            {downloadingId === tx.invoiceId ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <FileDown className="w-3 h-3 stroke-[1.5]" />
                            )}
                            <span>Reçu PDF</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-semibold text-xs">
                    <td colSpan={5} className="py-3 px-4 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[11px]">
                      Total Journalier ({transactions.length} encaissements)
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatMAD(summary.totalGlobal)}
                    </td>
                    <td className="print:hidden"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Fast Encaissement Modal ── */}
      <PaymentModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

function PaymentBadge({ method }: { method: PaymentMethod }) {
  switch (method) {
    case 'ESPECES':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          <Banknote className="w-3 h-3 stroke-[1.5]" />
          Espèces
        </span>
      )
    case 'TPE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
          <CreditCard className="w-3 h-3 stroke-[1.5]" />
          TPE (Carte)
        </span>
      )
    case 'CHEQUE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
          <FileText className="w-3 h-3 stroke-[1.5]" />
          Chèque
        </span>
      )
    case 'VIREMENT':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
          <Building className="w-3 h-3 stroke-[1.5]" />
          Virement
        </span>
      )
    default:
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600">
          {method}
        </span>
      )
  }
}
