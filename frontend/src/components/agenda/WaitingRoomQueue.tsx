import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  type Appointment,
  useDailyAgenda,
  useCallPatient,
  useUpdateAppointmentStatus,
} from '@/hooks/use-agenda'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import {
  Clock,
  Users,
  Stethoscope,
  Phone,
  Volume2,
  Check,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface WaitingRoomQueueProps {
  selectedDate?: string
  doctorFilter?: string
  maxItems?: number
  showDoctorPager?: boolean
  onPatientCalled?: (appointment: Appointment) => void
  className?: string
}

/**
 * Calculates elapsed minutes from an ISO timestamp string.
 */
function getElapsedMinutes(isoString?: string | null): number {
  if (!isoString) return 0
  const arrived = new Date(isoString).getTime()
  const now = Date.now()
  const diffMs = Math.max(0, now - arrived)
  return Math.floor(diffMs / 60000)
}

/**
 * High-Density Real-Time Waiting Room Queue Component.
 * - Displays patients in EN_ATTENTE sorted strictly by arrival timestamp (FIFO).
 * - Dynamic 60-second ticker updating elapsed wait duration badges.
 * - Color-coded: neutral (< 15 min), amber (15-30 min), rose alert (> 30 min).
 * - 1-Click Doctor Pager with global Alt+C keyboard shortcut.
 */
export function WaitingRoomQueue({
  selectedDate,
  doctorFilter,
  maxItems,
  showDoctorPager = false,
  onPatientCalled,
  className = '',
}: WaitingRoomQueueProps) {
  const navigate = useNavigate()
  const { role } = useAuthStore()
  const isDoctor = role === 'DOCTOR' || showDoctorPager

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const queryDate = selectedDate || todayStr

  const { data: appointments = [], isLoading } = useDailyAgenda(queryDate, doctorFilter)
  const callPatientMutation = useCallPatient()
  const updateStatusMutation = useUpdateAppointmentStatus()

  // ── 60-Second Ticker for Elapsed Waiting Time Badges ──
  const [, setTick] = useState<number>(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1)
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // ── Filter and FIFO Sort Waiting Room Patients ──
  const waitingPatients = useMemo(() => {
    const list = appointments.filter((a) => a.status === 'EN_ATTENTE')
    return list.sort((a, b) => {
      const timeA = a.arrivedAt ? new Date(a.arrivedAt).getTime() : new Date(a.startTime).getTime()
      const timeB = b.arrivedAt ? new Date(b.arrivedAt).getTime() : new Date(b.startTime).getTime()
      return timeA - timeB
    })
  }, [appointments])

  const displayList = maxItems ? waitingPatients.slice(0, maxItems) : waitingPatients
  const nextPatient = waitingPatients[0]

  // ── Action: Call Patient into Consultation ──
  const handleCall = useCallback(
    async (appointment: Appointment, openWorkspace = true) => {
      if (callPatientMutation.isPending) return

      try {
        await callPatientMutation.mutateAsync({
          id: appointment.id,
          roomLabel: 'Cabinet Médical',
        })

        if (onPatientCalled) {
          onPatientCalled(appointment)
        }

        if (openWorkspace && isDoctor) {
          navigate(
            `/app/consultation?appointmentId=${appointment.id}&patientId=${appointment.patientId}`
          )
        }
      } catch {
        // Handled by mutation toast
      }
    },
    [callPatientMutation, onPatientCalled, isDoctor, navigate]
  )

  // ── Keyboard Shortcut: Alt + C for Doctor ──
  useEffect(() => {
    if (!isDoctor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault()
        if (nextPatient) {
          toast.info(`Appel du patient suivant : ${nextPatient.patientName}`)
          handleCall(nextPatient, true)
        } else {
          toast.info("Aucun patient en attente dans la file.")
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDoctor, nextPatient, handleCall])

  return (
    <div
      className={`bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-lg shadow-clinical-card overflow-hidden flex flex-col ${className}`}
    >
      {/* ── Table Header ── */}
      <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-slate-100/70 dark:bg-zinc-950/40 select-none">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500 stroke-[1.5]" />
          <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            File d&apos;Attente Active
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold tabular-nums">
            {waitingPatients.length} en attente
          </span>
        </div>

        {/* Doctor 1-Click Priority Pager CTA */}
        {isDoctor && nextPatient && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleCall(nextPatient, true)}
              disabled={callPatientMutation.isPending}
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer gap-1.5 shadow-2xs"
            >
              {callPatientMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 stroke-[2]" />
              )}
              <span>Appeler suivant</span>
              <kbd className="hidden sm:inline-block text-[9px] font-mono bg-emerald-700/60 px-1 py-0.2 rounded text-emerald-100">
                Alt C
              </kbd>
            </Button>
          </div>
        )}
      </div>

      {/* ── Patient List / Queue ── */}
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800/70 overflow-y-auto">
        {isLoading ? (
          <div className="py-10 text-center text-xs text-zinc-500 font-mono flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Synchronisation de la salle d&apos;attente…</span>
          </div>
        ) : waitingPatients.length === 0 ? (
          <div className="py-10 text-center space-y-1">
            <div className="w-10 h-10 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Users className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Salle d&apos;attente vide
            </div>
            <div className="text-[11px] text-zinc-500 max-w-sm mx-auto">
              Aucun patient en attente. Dès qu&apos;une arrivée est pointée à l&apos;accueil, elle s&apos;affiche ici en temps réel.
            </div>
          </div>
        ) : (
          displayList.map((apt, index) => {
            const elapsedMins = getElapsedMinutes(apt.arrivedAt || apt.startTime)

            // ── Color-coded elapsed wait badge ──
            const badgeClass =
              elapsedMins >= 30
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                : elapsedMins >= 15
                ? 'badge-attente'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'

            const isNext = index === 0

            return (
              <div
                key={apt.id}
                className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isNext && isDoctor
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30'
                    : 'hover:bg-slate-50/90 dark:hover:bg-zinc-800/30'
                }`}
              >
                {/* Left: Queue Position & Patient Details */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  {/* Position Pill */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 shadow-2xs border ${
                      isNext
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {apt.patientName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        {apt.type}
                      </span>

                      {/* Live Dynamic Elapsed Wait Time Badge */}
                      <span
                        title={`Arrivé à ${
                          apt.arrivedAt
                            ? new Date(apt.arrivedAt).toLocaleTimeString('fr-MA', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : apt.startTime
                        }`}
                        className={`text-[10px] font-mono px-2 py-0.2 rounded border font-medium tabular-nums ${badgeClass}`}
                      >
                        ⏱ {elapsedMins} min
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-zinc-500 font-mono flex-wrap">
                      {apt.patientPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-zinc-400" />
                          {apt.patientPhone}
                        </span>
                      )}
                      <span>·</span>
                      <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                        RDV prévu : {apt.startTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  {isDoctor ? (
                    <Button
                      size="sm"
                      onClick={() => handleCall(apt, true)}
                      disabled={callPatientMutation.isPending}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer gap-1.5 shadow-2xs"
                    >
                      <Stethoscope className="w-3.5 h-3.5 stroke-[2]" />
                      <span>Appeler</span>
                    </Button>
                  ) : (
                    // Secretary Action: Direct check-in to consultation if doctor signals verbally
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: apt.id,
                          status: 'EN_CONSULTATION',
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                      className="h-7 text-xs border-zinc-300 dark:border-zinc-800 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      <span>Entré en consultation</span>
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Footer ── */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 flex items-center justify-between text-xs text-zinc-500 select-none">
        <span className="font-mono text-[11px]">
          Ordre chronologique d&apos;arrivée (FIFO) · Loi 09-08
        </span>
        {isDoctor && (
          <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
            Raccourci : <kbd className="px-1 py-0.5 border rounded bg-white dark:bg-zinc-900">Alt + C</kbd>
          </span>
        )}
      </div>
    </div>
  )
}
