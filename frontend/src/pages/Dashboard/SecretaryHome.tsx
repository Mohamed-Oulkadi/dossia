import { useState, useMemo } from 'react'
import {
  useDailyAgenda,
  useUpdateAppointmentStatus,
  type Appointment,
} from '@/hooks/use-agenda'
import {
  useDailyLedger,
  formatMAD,
  downloadReceiptPdf,
} from '@/hooks/use-billing'
import { useAppStore } from '@/store/useAppStore'
import { PaymentModal } from '@/components/billing/PaymentModal'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Clock,
  CheckCircle2,
  CalendarPlus,
  CreditCard,
  Banknote,
  Search,
  UserCheck,
  FileDown,
  ShieldCheck,
  Phone,
  Zap,
} from 'lucide-react'

export function SecretaryHome() {
  const { openModal } = useAppStore()
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [selectedDate] = useState<string>(todayStr)
  const [filterQuery, setFilterQuery] = useState('')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPatientForPayment, setSelectedPatientForPayment] = useState<Appointment | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const { data: appointments = [], isLoading: isLoadingAgenda } = useDailyAgenda(selectedDate)
  const { data: ledger, isLoading: isLoadingLedger } = useDailyLedger(selectedDate)
  const updateStatusMutation = useUpdateAppointmentStatus()

  // High-Density Metrics
  const totalAppointments = appointments.length
  const waitingPatients = appointments.filter((a) => a.status === 'EN_ATTENTE')
  const inConsultation = appointments.filter((a) => a.status === 'EN_CONSULTATION')
  const completedAppointments = appointments.filter((a) => a.status === 'TERMINE')

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    if (!filterQuery) return true
    const q = filterQuery.toLowerCase()
    return (
      a.patientName.toLowerCase().includes(q) ||
      a.patientPhone.includes(q) ||
      a.startTime.includes(q)
    )
  })

  // Quick 1-Click Check-In (Secretary 3-Second SLA)
  const handleQuickCheckIn = (apt: Appointment) => {
    // If waiting, mark as arrived / confirmed
    updateStatusMutation.mutate(
      { id: apt.id, status: 'EN_ATTENTE', date: selectedDate },
      {
        onSuccess: () => {
          toast.success(`Arrivée pointée : ${apt.patientName}`, {
            description: `Patient placé en salle d'attente à ${new Date().toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}.`,
          })
        },
      }
    )
  }

  const handleOpenPayment = (apt: Appointment) => {
    setSelectedPatientForPayment(apt)
    setIsPaymentModalOpen(true)
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

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-5 space-y-4">
      {/* Top Banner: Secretary High-Efficiency Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Poste Secrétariat & Accueil
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
              SLA 3s · Accueil & Encaissement
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Gestion des arrivées en temps réel, pointage salle d&apos;attente et caisse journalière en Dirham (MAD).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => openModal('new-appointment')}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer gap-1.5 shadow-2xs"
          >
            <CalendarPlus className="w-3.5 h-3.5 stroke-[2]" />
            Nouveau RDV (Alt+N)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPaymentModalOpen(true)}
            className="h-8 text-xs font-medium cursor-pointer gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 stroke-[1.5]" />
            Encaisser (Alt+C)
          </Button>
        </div>
      </div>

      {/* KPI Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-medium text-zinc-500">Rendez-vous prévus</div>
          <div className="text-lg font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-0.5">
            {totalAppointments}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            En Salle d&apos;Attente
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
            {waitingPatients.length}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            En Consultation
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            {inConsultation.length}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-medium text-zinc-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-zinc-400" />
            Consultations Terminées
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-0.5">
            {completedAppointments.length}
          </div>
        </div>
      </div>

      {/* Main Split Layout: 60% Left (Appointments & Check-in) | 40% Right (Caisse Rapide) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column (7 cols ~ 60%): Today's Schedule & 1-Click Check-In */}
        <div className="lg:col-span-7 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs overflow-hidden">
          {/* Header & Quick Search */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-950/40">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Planning du Jour ({appointments.length})
              </span>
            </div>

            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Rechercher patient, tél…"
                className="w-full h-7 pl-8 pr-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Appointments Table */}
          <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[520px]">
            {isLoadingAgenda ? (
              <div className="p-8 text-center text-xs text-zinc-500 font-mono">
                Synchronisation de l&apos;agenda…
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Aucun rendez-vous planifié pour cette journée.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50 text-[11px] font-medium text-zinc-500 uppercase tracking-wider select-none">
                    <th className="py-2 px-3 font-semibold">Heure</th>
                    <th className="py-2 px-3 font-semibold">Patient</th>
                    <th className="py-2 px-3 font-semibold">Type</th>
                    <th className="py-2 px-3 font-semibold text-center">Statut</th>
                    <th className="py-2 px-3 font-semibold text-right">Action Rapide</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
                  {filteredAppointments.map((apt) => {
                    const isArrived = apt.status === 'EN_ATTENTE'
                    const isInConsultation = apt.status === 'EN_CONSULTATION'
                    const isDone = apt.status === 'TERMINE'

                    return (
                      <tr
                        key={apt.id}
                        className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        {/* Time */}
                        <td className="py-2.5 px-3 font-mono text-[11px] font-semibold tabular-nums text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                          {apt.startTime}
                        </td>

                        {/* Patient Name & Phone */}
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-44">
                            {apt.patientName}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-zinc-400" />
                            {apt.patientPhone}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            {apt.type}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              isInConsultation
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : isArrived
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : isDone
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isInConsultation
                                  ? 'bg-emerald-500 animate-pulse'
                                  : isArrived
                                  ? 'bg-amber-500'
                                  : isDone
                                  ? 'bg-zinc-400'
                                  : 'bg-blue-500'
                              }`}
                            />
                            {isInConsultation
                              ? 'EN CONSULTATION'
                              : isArrived
                              ? 'SALLE ATTENTE'
                              : isDone
                              ? 'TERMINÉ'
                              : 'CONFIRMÉ'}
                          </span>
                        </td>

                        {/* Fast Action Buttons */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isArrived && !isInConsultation && !isDone && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickCheckIn(apt)}
                                className="h-6 px-2 text-[10px] font-medium border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer gap-1"
                              >
                                <UserCheck className="w-3 h-3" />
                                Pointer Arrivée
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenPayment(apt)}
                              className="h-6 px-2 text-[10px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer gap-1"
                              title="Encaisser les honoraires"
                            >
                              <CreditCard className="w-3 h-3 text-zinc-500" />
                              Encaisser
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 flex items-center justify-between text-[11px] text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>SLA : Pointer l&apos;arrivée notifie instantanément le médecin.</span>
            </div>
            <span className="font-mono tabular-nums">{filteredAppointments.length} patients</span>
          </div>
        </div>

        {/* Right Column (5 cols ~ 40%): Caisse Rapide & Rapprochement Journalier */}
        <div className="lg:col-span-5 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/40">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Caisse Rapide du Jour
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {new Date().toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Total Encaissé Card */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-emerald-50/40 dark:bg-emerald-950/10">
            <div className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400">
              Total Encaissé Aujourd&apos;hui
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatMAD(summary.totalGlobal)}
              </span>
              <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
                MAD
              </span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 font-mono">
              {summary.transactionCount} encaissement{summary.transactionCount > 1 ? 's' : ''} enregistré{summary.transactionCount > 1 ? 's' : ''}
            </div>
          </div>

          {/* Breakdown by Payment Method */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="text-[10px] text-zinc-500 font-medium">Espèces</div>
              <div className="text-xs font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100 mt-0.5">
                {formatMAD(summary.totalCash)}
              </div>
            </div>

            <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="text-[10px] text-zinc-500 font-medium">TPE</div>
              <div className="text-xs font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100 mt-0.5">
                {formatMAD(summary.totalTpe)}
              </div>
            </div>

            <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="text-[10px] text-zinc-500 font-medium">Chèque / Vir.</div>
              <div className="text-xs font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100 mt-0.5">
                {formatMAD(summary.totalCheck + summary.totalTransfer)}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[300px]">
            <div className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Derniers Règlements</span>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                + Nouveau Renseignement
              </button>
            </div>

            {isLoadingLedger ? (
              <div className="py-6 text-center text-xs text-zinc-500 font-mono">
                Chargement des encaissements…
              </div>
            ) : (ledger?.transactions.length ?? 0) === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                Aucun paiement enregistré pour cette journée.
              </div>
            ) : (
              <div className="space-y-1.5">
                {ledger?.transactions.slice(0, 6).map((tx) => (
                  <div
                    key={tx.paymentId}
                    className="flex items-center justify-between p-2 rounded-md bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 text-xs"
                  >
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {tx.patientName}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        {tx.paymentMethod} · {tx.referenceNumber || 'Sans réf.'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                        {formatMAD(tx.amount)} <span className="text-[10px] font-normal text-zinc-500">MAD</span>
                      </span>

                      <button
                        onClick={() => handleDownloadReceipt(tx.invoiceId)}
                        disabled={downloadingId === tx.invoiceId}
                        title="Télécharger le reçu légal en MAD"
                        className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5 stroke-[1.5]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CNDP Security Notice (Zero Clinical Data) */}
          <div className="p-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 flex items-center gap-2 text-[10px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>
              CNDP Loi 09-08 : Conformité secrétariat stricte — Aucun diagnostic ou acte médical sensible exposé.
            </span>
          </div>
        </div>
      </div>

      {/* Global Payment Modal */}
      <PaymentModal
        open={isPaymentModalOpen}
        onOpenChange={(isOpen) => {
          setIsPaymentModalOpen(isOpen)
          if (!isOpen) setSelectedPatientForPayment(null)
        }}
        patientId={selectedPatientForPayment?.patientId || ''}
        patientName={selectedPatientForPayment?.patientName || ''}
        defaultAmount={300}
      />
    </div>
  )
}
export default SecretaryHome
