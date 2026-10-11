/**
 * SmartAgenda — Dense, keyboard-navigable appointment system
 * Dual-Theme Support (Light Mode / Dark Mode)
 * 
 * - Density Pass: compact enterprise spacing (py-2 px-3 text-xs, row height h-9/h-10)
 * - Interactive Time-Grid with clear visual hierarchy:
 *     'En attente', 'En consultation', 'Terminé'
 * - Standardized Lucide icons: w-4 h-4 stroke-[1.5]
 * - Strict Moroccan formats: font-mono tabular-nums for MAD, CNSS, and +212 phones
 * - 1px hairline border system (border-zinc-200 dark:border-zinc-800)
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgendaStore } from '@/store/useAgendaStore'
import { MOCK_PATIENTS, type AppointmentStatus, type Appointment } from '@/types/moroccan'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CalendarPlus,
  FileText,
  CreditCard,
  Clock,
  User,
  LayoutList,
  LayoutGrid,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'

// ─────────────────────────────────────────────────
// Clinical Status Badge Component
// ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: AppointmentStatus }) {
  switch (status) {
    case 'En consultation':
      return (
        <Badge variant="consultation" className="gap-1.5 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
          En consultation
        </Badge>
      )
    case 'En attente':
      return (
        <Badge variant="attente" className="gap-1.5 font-mono">
          <Clock className="w-3 h-3 stroke-[1.5]" />
          En attente
        </Badge>
      )
    case 'Terminé':
      return (
        <Badge variant="termine" className="gap-1.5 font-mono">
          <CheckCircle2 className="w-3 h-3 stroke-[1.5]" />
          Terminé
        </Badge>
      )
    case 'Annulé':
      return (
        <Badge variant="annule" className="gap-1.5 font-mono">
          <AlertCircle className="w-3 h-3 stroke-[1.5]" />
          Annulé
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="gap-1.5 font-mono">
          {status}
        </Badge>
      )
  }
}

// ─────────────────────────────────────────────────
// Patient Detail Drawer (Hairline 1px border, compact)
// ─────────────────────────────────────────────────
function PatientPanel({
  patientId,
  selectedAppt,
  onClose,
}: {
  patientId: string
  selectedAppt?: Appointment
  onClose: () => void
}) {
  const { openModal } = useAppStore()
  const patient = MOCK_PATIENTS.find((p) => p.id === patientId)
  if (!patient) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="
        fixed right-0 top-12 bottom-0 z-40 w-84
        bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800
        flex flex-col overflow-hidden shadow-xl
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400 stroke-[1.5]" />
          <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 tracking-tight">
            Fiche Patient &amp; Acte
          </h3>
        </div>
        <button
          onClick={onClose}
          id="close-patient-panel"
          className="rounded-xs p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Patient Identity */}
        <div className="flex items-center gap-3 p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
          <div className="
            w-9 h-9 rounded-md flex items-center justify-center text-xs font-semibold
            bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700/60 font-mono
          ">
            {patient.nomComplet.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
              {patient.nomComplet}
            </p>
            <p className="text-[11px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400 truncate">
              {patient.telephone}
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {patient.assurance}
          </Badge>
        </div>

        {/* Current Consultation State */}
        {selectedAppt && (
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/30 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                Séance du jour
              </span>
              <StatusBadge status={selectedAppt.status} />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="font-mono text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {selectedAppt.heureDebut} — {selectedAppt.heureFin}
              </span>
            </div>
            <p className="text-xs text-zinc-800 dark:text-zinc-300 font-medium">
              {selectedAppt.motif}
            </p>
          </div>
        )}

        {/* Clinical Info List */}
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/20 text-xs">
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-zinc-500 text-[11px]">Date Naissance</span>
            <span className="font-mono tabular-nums text-zinc-800 dark:text-zinc-300 text-[11px]">
              {new Date(patient.dateNaissance).toLocaleDateString('fr-MA')}
            </span>
          </div>
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-zinc-500 text-[11px]">Ville</span>
            <span className="text-zinc-800 dark:text-zinc-300 text-[11px]">{patient.ville}</span>
          </div>
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-zinc-500 text-[11px]">N° CNSS</span>
            <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-200 text-[11px]">
              {patient.cnss ?? 'Non renseigné'}
            </span>
          </div>
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-zinc-500 text-[11px]">N° AMO</span>
            <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-200 text-[11px]">
              {patient.amo ?? '—'}
            </span>
          </div>
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-zinc-500 text-[11px]">Honoraires consultation</span>
            <span className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100 text-[11px]">
              300.00 MAD
            </span>
          </div>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5 bg-white dark:bg-zinc-950">
        <Button
          id="generate-cnss-btn"
          size="sm"
          variant="outline"
          className="w-full justify-start text-xs border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          onClick={() => openModal('generate-cnss')}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />
          <span>Éditer Feuille de Soins CNSS</span>
        </Button>
        <Button
          id="add-payment-patient-btn"
          size="sm"
          className="w-full justify-start text-xs"
          onClick={() => openModal('add-payment')}
        >
          <CreditCard className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Encaisser Honoraires (MAD)</span>
        </Button>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────
// Interactive Time-Grid Component
// ─────────────────────────────────────────────────
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30',
]

function TimeGridView({
  appointments,
  selectedId,
  onSelect,
}: {
  appointments: Appointment[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const { openModal } = useAppStore()

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            En consultation (Au fauteuil)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
            En attente (Salle d&apos;attente)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
            Terminé (Facturé)
          </span>
        </div>
        <span className="font-mono text-[11px] text-zinc-500">
          Créneaux de 30 min · Agadir
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pt-2">
        {TIME_SLOTS.map((slot) => {
          const appt = appointments.find((a) => a.heureDebut === slot)
          const patient = appt ? MOCK_PATIENTS.find((p) => p.id === appt.patientId) : null
          const isSelected = appt && appt.id === selectedId

          if (!appt) {
            return (
              <div
                key={slot}
                onClick={() => openModal('new-consultation')}
                className="
                  group h-20 rounded-md border border-dashed border-zinc-200 dark:border-zinc-800/80
                  bg-zinc-50/50 dark:bg-transparent
                  p-2.5 flex flex-col justify-between
                  hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer
                "
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                    {slot}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-700 dark:group-hover:text-zinc-400 transition-colors">
                    + Dispo
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-700 dark:group-hover:text-zinc-400 transition-colors">
                  Créneau libre
                </span>
              </div>
            )
          }

          // Visual state styling
          const isConsultation = appt.status === 'En consultation'
          const isAttente = appt.status === 'En attente'
          const isTermine = appt.status === 'Terminé'

          let cardBorder = 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40'
          if (isConsultation) {
            cardBorder = 'border-emerald-500/50 dark:border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-xs'
          } else if (isAttente) {
            cardBorder = 'border-amber-400/50 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/15'
          } else if (isTermine) {
            cardBorder = 'border-zinc-200 dark:border-zinc-800/70 bg-zinc-100/50 dark:bg-zinc-900/20 opacity-80'
          }

          if (isSelected) {
            cardBorder += ' ring-1 ring-zinc-400 dark:ring-zinc-500'
          }

          return (
            <div
              key={slot}
              onClick={() => onSelect(isSelected ? null : appt.id)}
              className={`
                h-20 rounded-md border p-2.5 flex flex-col justify-between
                transition-all cursor-pointer ${cardBorder}
                hover:border-zinc-400 dark:hover:border-zinc-600
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-200">
                    {appt.heureDebut}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                    — {appt.heureFin}
                  </span>
                </div>
                <StatusBadge status={appt.status} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {patient?.nomComplet ?? 'Patient'}
                  </p>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {patient?.assurance}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {appt.motif}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// SmartAgenda Main View
// ─────────────────────────────────────────────────
export function SmartAgenda() {
  const { appointments, selectedAppointmentId, selectAppointment } = useAgendaStore()
  const { openCommandPalette, openModal } = useAppStore()
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [statusFilter, setStatusFilter] = useState<string>('Tous')

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const todayLabel = today.toLocaleDateString('fr-MA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const todayAppointments = appointments.filter((a) => a.date === todayStr)

  const filteredAppointments = todayAppointments.filter((a) => {
    if (statusFilter === 'Tous') return true
    return a.status === statusFilter
  })

  // Keyboard navigation
  useKeyboardShortcuts([
    { combo: 'ctrl+k', action: openCommandPalette },
    { combo: 'alt+n',  action: () => openModal('new-consultation') },
    { combo: 'escape', action: () => selectAppointment(null), allowInInput: true },
  ])

  const stats = {
    total:        todayAppointments.length,
    consultation: todayAppointments.filter((a) => a.status === 'En consultation').length,
    attente:      todayAppointments.filter((a) => a.status === 'En attente').length,
    termine:      todayAppointments.filter((a) => a.status === 'Terminé').length,
  }

  const selectedAppt = appointments.find((a) => a.id === selectedAppointmentId)

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* ── Enterprise Header (Compact, 1px border) ──────────────── */}
      <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Agenda du Jour
              </h1>
              <span className="font-mono text-[11px] text-zinc-500">
                · {stats.total} consultations
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 capitalize">
              {todayLabel}
            </p>
          </div>
        </div>

        {/* Center: status summary counts */}
        <div className="hidden lg:flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('Tous')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
              statusFilter === 'Tous'
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Tous ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter('En consultation')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
              statusFilter === 'En consultation'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                : 'text-emerald-600 dark:text-emerald-500/70 hover:text-emerald-700 dark:hover:text-emerald-400'
            }`}
          >
            En consultation ({stats.consultation})
          </button>
          <button
            onClick={() => setStatusFilter('En attente')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
              statusFilter === 'En attente'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30'
                : 'text-amber-600 dark:text-amber-500/70 hover:text-amber-700 dark:hover:text-amber-400'
            }`}
          >
            En attente ({stats.attente})
          </button>
          <button
            onClick={() => setStatusFilter('Terminé')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
              statusFilter === 'Terminé'
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Terminés ({stats.termine})
          </button>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100 dark:bg-zinc-900/60">
            <button
              onClick={() => setViewMode('table')}
              title="Vue Tableau Compact"
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Grille Horaire (Time-Grid)"
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>

          {/* New consultation button */}
          <Button
            id="new-appointment-btn"
            size="sm"
            onClick={() => openModal('new-consultation')}
            className="gap-1.5"
          >
            <CalendarPlus className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Nouveau RDV</span>
            <kbd className="text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.2 rounded text-zinc-700 dark:text-zinc-300">
              Alt+N
            </kbd>
          </Button>
        </div>
      </div>

      {/* ── Main View (Table vs Grid) ──────────────── */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'grid' ? (
          <TimeGridView
            appointments={todayAppointments}
            selectedId={selectedAppointmentId}
            onSelect={selectAppointment}
          />
        ) : filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <Clock className="w-8 h-8 mb-2 text-zinc-400 dark:text-zinc-600 stroke-[1.5]" />
            <p className="text-xs">Aucun rendez-vous trouvé</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal('new-consultation')}
              className="mt-3 text-xs"
            >
              Planifier un rendez-vous
            </Button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse bg-white dark:bg-zinc-950">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 h-8">
                <th className="py-2 px-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-28 font-mono">
                  Heure
                </th>
                <th className="py-2 px-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Patient &amp; Contact
                </th>
                <th className="py-2 px-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Motif consultation
                </th>
                <th className="py-2 px-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-24">
                  Couverture
                </th>
                <th className="py-2 px-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-36">
                  Statut
                </th>
                <th className="py-2 px-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
              {filteredAppointments.map((appt) => {
                const patient = MOCK_PATIENTS.find((p) => p.id === appt.patientId)
                const isSelected = selectedAppointmentId === appt.id

                return (
                  <tr
                    key={appt.id}
                    onClick={() => selectAppointment(isSelected ? null : appt.id)}
                    className={`
                      h-10 transition-colors cursor-pointer group text-xs
                      ${isSelected
                        ? 'bg-zinc-100/90 dark:bg-zinc-900/90'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                      }
                    `}
                  >
                    {/* Heure (font-mono tabular-nums) */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-baseline gap-1 font-mono tabular-nums">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                          {appt.heureDebut}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {appt.heureFin}
                        </span>
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300">
                          {patient?.nomComplet.charAt(0) ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-zinc-900 dark:text-zinc-200 truncate block">
                            {patient?.nomComplet ?? 'Inconnu'}
                          </span>
                          <span className="text-[10px] font-mono tabular-nums text-zinc-500 truncate block">
                            {patient?.telephone}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Motif */}
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                      {appt.motif}
                    </td>

                    {/* Couverture CNSS / AMO */}
                    <td className="py-2 px-3">
                      <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                        {patient?.assurance ?? 'Privé'}
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="py-2 px-3">
                      <StatusBadge status={appt.status} />
                    </td>

                    {/* Actions compact */}
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`appt-cnss-${appt.id}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            openModal('generate-cnss')
                          }}
                          title="Feuille CNSS"
                          className="p-1 rounded text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                        <button
                          id={`appt-pay-${appt.id}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            openModal('add-payment')
                          }}
                          title="Encaisser (MAD)"
                          className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-700 dark:group-hover:text-zinc-400 transition-colors" />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Slide-in Patient Detail Drawer ──────── */}
      <AnimatePresence>
        {selectedAppointmentId && selectedAppt && (
          <PatientPanel
            key={selectedAppt.patientId}
            patientId={selectedAppt.patientId}
            selectedAppt={selectedAppt}
            onClose={() => selectAppointment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
