/**
 * SmartAgenda — High-Density Clinical Time-Grid & Schedule Management
 * Secretary-First Architecture:
 * - 15-Minute Day-View Time-Grid (08:00 to 19:00)
 * - 1-Click Status Transitions (En attente -> En consultation -> Terminé) via PATCH /api/v1/agenda/{id}/status
 * - Real-Time Server Synchronization via TanStack Query (useDailyAgenda)
 * - Alt+N Global Shortcut to trigger NewAppointmentModal with Patient Combobox
 * - Strict Moroccan Standards: font-mono tabular-nums, Casablanca timezone normalization
 */
import { useState, useMemo } from 'react'
import {
  useDailyAgenda,
  useUpdateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
  type AppointmentType,
} from '@/hooks/use-agenda'
import { useAppStore } from '@/store/useAppStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CalendarPlus,
  Clock,
  LayoutList,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  FileText,
  CreditCard,
  X,
  Loader2,
} from 'lucide-react'

// 15-Minute increments from 08:00 to 18:45
const DAY_SLOTS: string[] = []
for (let h = 8; h <= 18; h++) {
  for (let m = 0; m < 60; m += 15) {
    DAY_SLOTS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
}

// ─────────────────────────────────────────────────
// Clinical Status Badge Component
// ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: AppointmentStatus }) {
  switch (status) {
    case 'EN_CONSULTATION':
      return (
        <Badge variant="consultation" className="gap-1.5 font-mono text-[10px] py-0 px-2 h-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
          En consultation
        </Badge>
      )
    case 'EN_ATTENTE':
      return (
        <Badge variant="attente" className="gap-1.5 font-mono text-[10px] py-0 px-2 h-5">
          <Clock className="w-3 h-3 stroke-[1.5]" />
          En attente
        </Badge>
      )
    case 'TERMINE':
      return (
        <Badge variant="termine" className="gap-1.5 font-mono text-[10px] py-0 px-2 h-5">
          <CheckCircle2 className="w-3 h-3 stroke-[1.5]" />
          Terminé
        </Badge>
      )
    case 'ANNULE':
      return (
        <Badge variant="annule" className="gap-1.5 font-mono text-[10px] py-0 px-2 h-5">
          <AlertCircle className="w-3 h-3 stroke-[1.5]" />
          Annulé
        </Badge>
      )
    case 'NO_SHOW':
      return (
        <Badge variant="outline" className="gap-1 font-mono text-[10px] py-0 px-2 h-5 text-zinc-500">
          Absent
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="font-mono text-[10px] py-0 px-2 h-5">
          {status}
        </Badge>
      )
  }
}

// ─────────────────────────────────────────────────
// Appointment Type Color Styling
// ─────────────────────────────────────────────────
function getTypeStyle(type: AppointmentType) {
  switch (type) {
    case 'URGENCE':
      return {
        bg: 'bg-rose-50/90 dark:bg-rose-950/25',
        border: 'border-rose-300 dark:border-rose-800/60',
        text: 'text-rose-900 dark:text-rose-200',
        tag: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300',
      }
    case 'CONTROLE':
      return {
        bg: 'bg-emerald-50/90 dark:bg-emerald-950/20',
        border: 'border-emerald-300 dark:border-emerald-800/60',
        text: 'text-emerald-900 dark:text-emerald-200',
        tag: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300',
      }
    case 'CONSULTATION':
    default:
      return {
        bg: 'bg-sky-50/80 dark:bg-sky-950/20',
        border: 'border-sky-200 dark:border-sky-800/50',
        text: 'text-sky-950 dark:text-sky-200',
        tag: 'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300',
      }
  }
}

// ─────────────────────────────────────────────────
// 1-Click Status Dropdown Component
// ─────────────────────────────────────────────────
function StatusActionMenu({
  appointment,
  onUpdateStatus,
  isPending,
}: {
  appointment: Appointment
  onUpdateStatus: (id: string, status: AppointmentStatus) => void
  isPending: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        disabled={isPending}
        className="p-1 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        title="Changer le statut"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <MoreVertical className="w-3.5 h-3.5 stroke-[1.5]" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
          />
          <div
            className="
              absolute right-0 top-full mt-1 z-50 w-44 rounded-md
              bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
              shadow-lg py-1 text-xs divide-y divide-zinc-100 dark:divide-zinc-800/60
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Déplacer Patient
            </div>
            <div className="py-0.5">
              {appointment.status !== 'EN_CONSULTATION' && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(appointment.id, 'EN_CONSULTATION')
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Au fauteuil (En consultation)
                </button>
              )}
              {appointment.status !== 'EN_ATTENTE' && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(appointment.id, 'EN_ATTENTE')
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3 h-3" />
                  Salle d&apos;attente
                </button>
              )}
              {appointment.status !== 'TERMINE' && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(appointment.id, 'TERMINE')
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Terminer consultation
                </button>
              )}
            </div>
            <div className="py-0.5">
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(appointment.id, 'NO_SHOW')
                  setIsOpen(false)
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 cursor-pointer"
              >
                Absent (No-Show)
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(appointment.id, 'ANNULE')
                  setIsOpen(false)
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
                Annuler RDV
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────
// SmartAgenda Component
// ─────────────────────────────────────────────────
export function SmartAgenda() {
  const { openCommandPalette, openModal } = useAppStore()

  // Date navigation state (Defaults to today in YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('Tous')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)

  // Live Query from Spring Boot backend
  const { data: appointments = [], isLoading, isError, refetch } = useDailyAgenda(
    selectedDate,
    selectedDoctor || undefined
  )

  const updateStatusMutation = useUpdateAppointmentStatus()

  // Quick keyboard shortcuts (AGENTS.md Rule)
  useKeyboardShortcuts([
    { combo: 'ctrl+k', action: openCommandPalette },
    { combo: 'alt+n', action: () => openModal('new-consultation') },
    { combo: 'escape', action: () => setSelectedAppointmentId(null), allowInInput: true },
  ])

  // Filter appointments by status filter
  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'Tous') return appointments
    return appointments.filter((a) => a.status === statusFilter)
  }, [appointments, statusFilter])

  // Aggregate daily statistics
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      consultation: appointments.filter((a) => a.status === 'EN_CONSULTATION').length,
      attente: appointments.filter((a) => a.status === 'EN_ATTENTE').length,
      termine: appointments.filter((a) => a.status === 'TERMINE').length,
    }
  }, [appointments])

  // Helper for formatting time from ISO
  const formatSlotTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      return `${h}:${m}`
    } catch {
      return '--:--'
    }
  }

  // Handle Day Stepping (< / >)
  const stepDate = (days: number) => {
    const current = new Date(selectedDate)
    current.setDate(current.getDate() + days)
    setSelectedDate(current.toISOString().split('T')[0])
  }

  const selectedAppointment = appointments.find((a) => a.id === selectedAppointmentId)

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* ── Enterprise Header (Compact, 1px hairline border) ── */}
      <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-zinc-950">
        {/* Left: Date controls & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100/60 dark:bg-zinc-900/60">
            <button
              onClick={() => stepDate(-1)}
              title="Jour précédent"
              className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-2 py-0.5 text-[11px] font-medium font-mono rounded hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => stepDate(1)}
              title="Jour suivant"
              className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-7 px-2 text-xs font-mono tabular-nums rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
            <span className="font-mono text-[11px] text-zinc-500">
              · {stats.total} RDV planifiés
            </span>
          </div>

          {/* Practitioner Filter */}
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="h-7 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="">Tous les praticiens</option>
            <option value="Dr. Amina Benjelloun">Dr. Amina Benjelloun</option>
            <option value="Dr. Mehdi Tazi">Dr. Mehdi Tazi</option>
            <option value="Dr. Youssef Alami">Dr. Youssef Alami</option>
          </select>
        </div>

        {/* Center: Status counts */}
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
            onClick={() => setStatusFilter('EN_CONSULTATION')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
              statusFilter === 'EN_CONSULTATION'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                : 'text-emerald-600 dark:text-emerald-500/70 hover:text-emerald-700 dark:hover:text-emerald-400'
            }`}
          >
            Au fauteuil ({stats.consultation})
          </button>
          <button
            onClick={() => setStatusFilter('EN_ATTENTE')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
              statusFilter === 'EN_ATTENTE'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30'
                : 'text-amber-600 dark:text-amber-500/70 hover:text-amber-700 dark:hover:text-amber-400'
            }`}
          >
            En attente ({stats.attente})
          </button>
          <button
            onClick={() => setStatusFilter('TERMINE')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
              statusFilter === 'TERMINE'
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Terminés ({stats.termine})
          </button>
        </div>

        {/* Right: View switcher & Alt+N Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100 dark:bg-zinc-900/60">
            <button
              onClick={() => setViewMode('grid')}
              title="Vue Grille 15-min"
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Vue Liste Compacte"
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>

          <Button
            id="new-appointment-btn"
            size="sm"
            onClick={() => openModal('new-consultation')}
            className="gap-1.5 h-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800"
          >
            <CalendarPlus className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Nouveau RDV</span>
            <kbd className="text-[10px] font-mono bg-zinc-700 dark:bg-zinc-200 px-1 py-0.2 rounded text-zinc-200 dark:text-zinc-800">
              Alt+N
            </kbd>
          </Button>
        </div>
      </div>

      {/* ── Main Schedule Area ── */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin stroke-[1.5]" />
            <span className="text-xs font-mono">Chargement de l&apos;agenda…</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-zinc-500">
            <AlertCircle className="w-6 h-6 text-rose-500 stroke-[1.5]" />
            <span className="text-xs">Erreur lors de la récupération de l&apos;agenda.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs mt-2">
              Réessayer
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── 15-Minute Day-View Time-Grid ── */
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  Consultation
                </span>
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Contrôle
                </span>
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Urgence
                </span>
              </div>
              <span className="font-mono text-[11px] text-zinc-500">
                Fuseau horaire: Africa/Casablanca (GMT+1)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {DAY_SLOTS.map((slot) => {
                const appt = filteredAppointments.find(
                  (a) => formatSlotTime(a.startTime) === slot
                )
                const isSelected = appt && appt.id === selectedAppointmentId

                if (!appt) {
                  return (
                    <div
                      key={slot}
                      onClick={() => openModal('new-consultation')}
                      className="
                        group h-18 rounded-md border border-dashed border-zinc-200 dark:border-zinc-800/80
                        bg-zinc-50/50 dark:bg-transparent p-2 flex flex-col justify-between
                        hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/40
                        transition-colors cursor-pointer
                      "
                      title="Créneau disponible — Cliquer pour planifier"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                          {slot}
                        </span>
                        <span className="text-[10px] text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                          + Libre
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400/80 group-hover:text-zinc-600 dark:group-hover:text-zinc-400">
                        15 min
                      </span>
                    </div>
                  )
                }

                const style = getTypeStyle(appt.type)

                return (
                  <div
                    key={slot}
                    onClick={() =>
                      setSelectedAppointmentId(isSelected ? null : appt.id)
                    }
                    className={`
                      h-18 rounded-md border p-2 flex flex-col justify-between
                      transition-all cursor-pointer ${style.bg} ${style.border}
                      ${isSelected ? 'ring-1 ring-zinc-500 dark:ring-zinc-400 shadow-sm' : ''}
                      hover:shadow-xs
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 font-mono text-[11px] tabular-nums font-semibold">
                        <span>{formatSlotTime(appt.startTime)}</span>
                        <span className="text-[10px] text-zinc-400 font-normal">
                          — {formatSlotTime(appt.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusBadge status={appt.status} />
                        <StatusActionMenu
                          appointment={appt}
                          onUpdateStatus={(id, status) =>
                            updateStatusMutation.mutate({ id, status })
                          }
                          isPending={updateStatusMutation.isPending}
                        />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-semibold truncate ${style.text}`}>
                          {appt.patientName}
                        </p>
                        <span className={`text-[9px] font-mono px-1 rounded uppercase ${style.tag}`}>
                          {appt.type.slice(0, 4)}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400 truncate">
                        {appt.patientPhone || appt.doctorName}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* ── Compact Table View ── */
          filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <Clock className="w-8 h-8 mb-2 text-zinc-400 stroke-[1.5]" />
              <p className="text-xs">Aucun rendez-vous pour cette date</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal('new-consultation')}
                className="mt-3 text-xs"
              >
                Planifier un rendez-vous (Alt+N)
              </Button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse bg-white dark:bg-zinc-950">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 h-8">
                  <th className="py-2 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-28 font-mono">
                    Créneau
                  </th>
                  <th className="py-2 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Patient &amp; Téléphone
                  </th>
                  <th className="py-2 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Praticien
                  </th>
                  <th className="py-2 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-28">
                    Type
                  </th>
                  <th className="py-2 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-36">
                    Statut
                  </th>
                  <th className="py-2 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-right w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-xs">
                {filteredAppointments.map((appt) => {
                  const style = getTypeStyle(appt.type)
                  const isSelected = selectedAppointmentId === appt.id

                  return (
                    <tr
                      key={appt.id}
                      onClick={() =>
                        setSelectedAppointmentId(isSelected ? null : appt.id)
                      }
                      className={`
                        h-10 transition-colors cursor-pointer
                        ${isSelected ? 'bg-zinc-100 dark:bg-zinc-900' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40'}
                      `}
                    >
                      <td className="py-2 px-3 whitespace-nowrap font-mono tabular-nums">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatSlotTime(appt.startTime)}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {' '}— {formatSlotTime(appt.endTime)}
                        </span>
                      </td>

                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {appt.patientName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100 block">
                              {appt.patientName}
                            </span>
                            <span className="text-[10px] font-mono tabular-nums text-zinc-500">
                              {appt.patientPhone}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">
                        {appt.doctorName}
                      </td>

                      <td className="py-2 px-3">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${style.tag}`}>
                          {appt.type}
                        </span>
                      </td>

                      <td className="py-2 px-3">
                        <StatusBadge status={appt.status} />
                      </td>

                      <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <StatusActionMenu
                          appointment={appt}
                          onUpdateStatus={(id, status) =>
                            updateStatusMutation.mutate({ id, status })
                          }
                          isPending={updateStatusMutation.isPending}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* ── Slide-Over Patient / Appointment Drawer ── */}
      {selectedAppointment && (
        <div className="fixed right-0 top-12 bottom-0 z-40 w-84 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
              Détails du Rendez-vous
            </h3>
            <button
              onClick={() => setSelectedAppointmentId(null)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto text-xs">
            <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Patient</span>
              <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                {selectedAppointment.patientName}
              </p>
              <p className="text-[11px] font-mono tabular-nums text-zinc-500">
                {selectedAppointment.patientPhone}
              </p>
            </div>

            <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Statut</span>
                <StatusBadge status={selectedAppointment.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Horaire</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                  {formatSlotTime(selectedAppointment.startTime)} — {formatSlotTime(selectedAppointment.endTime)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Praticien</span>
                <span className="text-zinc-800 dark:text-zinc-200">{selectedAppointment.doctorName}</span>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Notes Cliniques</span>
                <p className="text-zinc-700 dark:text-zinc-300 text-xs">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start text-xs"
              onClick={() => openModal('generate-cnss')}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600 stroke-[1.5]" />
              <span>Feuille de Soins CNSS</span>
            </Button>
            <Button
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => openModal('add-payment')}
            >
              <CreditCard className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Encaisser Honoraires (MAD)</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
