import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useCreateAppointment, type AppointmentType } from '@/hooks/use-agenda'
import { usePatients } from '@/hooks/use-patients'
import { Search, Calendar, Loader2 } from 'lucide-react'

const TIME_OPTIONS = [
  '08:00', '08:15', '08:30', '08:45',
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45',
  '17:00', '17:15', '17:30', '17:45',
  '18:00', '18:15', '18:30',
]

export function NewAppointmentModal({
  defaultDate,
  defaultTime,
}: {
  defaultDate?: string
  defaultTime?: string
}) {
  const { activeModal, closeModal, openModal } = useAppStore()
  const { user, role } = useAuthStore()

  // Support both 'new-appointment' (used by SecretaryHome) and 'new-consultation' (used by SmartAgenda/Palette)
  const isOpen = activeModal === 'new-appointment' || activeModal === 'new-consultation'

  const { data: patientsPage, isLoading: isLoadingPatients } = usePatients(0, 100)
  const createAppointment = useCreateAppointment()

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const defaultDoctor = useMemo(() => {
    if (role === 'DOCTOR' && user) {
      return `Dr. ${user.firstName} ${user.lastName}`
    }
    return 'Dr. Rachid Amrani'
  }, [role, user])

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [patientSearch, setPatientSearch] = useState<string>('')
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)

  const [date, setDate] = useState<string>(defaultDate || todayStr)
  const [startTime, setStartTime] = useState<string>(defaultTime || '09:00')
  const [durationMinutes, setDurationMinutes] = useState<number>(30)
  const [doctorName, setDoctorName] = useState<string>(defaultDoctor)
  const [type, setType] = useState<AppointmentType>('CONSULTATION')
  const [notes, setNotes] = useState<string>('')

  // Clean form state on modal open
  useEffect(() => {
    if (isOpen) {
      setSelectedPatientId('')
      setPatientSearch('')
      setIsSearchOpen(false)
      setDate(defaultDate || new Date().toISOString().split('T')[0])
      setStartTime(defaultTime || '09:00')
      setDurationMinutes(30)
      setDoctorName(defaultDoctor)
      setType('CONSULTATION')
      setNotes('')
    }
  }, [isOpen, defaultDate, defaultTime, defaultDoctor])

  // Filter patients based on combobox search
  const filteredPatients = useMemo(() => {
    if (!patientsPage?.content) return []
    const q = patientSearch.toLowerCase().trim()
    if (!q) return patientsPage.content.slice(0, 8)
    return patientsPage.content.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.cin.toLowerCase().includes(q) ||
        p.phoneNumber.includes(q)
    )
  }, [patientsPage?.content, patientSearch])

  const selectedPatient = useMemo(() => {
    return patientsPage?.content.find((p) => p.id === selectedPatientId)
  }, [patientsPage?.content, selectedPatientId])

  // Compute end time string
  const computeEndTime = (start: string, duration: number) => {
    const [h, m] = start.split(':').map(Number)
    const totalMinutes = h * 60 + m + duration
    const endH = Math.floor(totalMinutes / 60)
    const endM = totalMinutes % 60
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatientId) return

    const endTime = computeEndTime(startTime, durationMinutes)

    // Construct ISO strings with Moroccan offset (+01:00)
    const startIso = `${date}T${startTime}:00+01:00`
    const endIso = `${date}T${endTime}:00+01:00`

    try {
      await createAppointment.mutateAsync({
        patientId: selectedPatientId,
        doctorName: doctorName.trim(),
        startTime: startIso,
        endTime: endIso,
        type,
        notes: notes.trim() || undefined,
      })

      // Reset form
      setSelectedPatientId('')
      setPatientSearch('')
      setNotes('')
      closeModal()
    } catch {
      // Error notifications are already handled by axios interceptor
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />
              <DialogTitle>Nouveau Rendez-vous</DialogTitle>
            </div>
            <kbd className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
              Alt+N
            </kbd>
          </div>
          <DialogDescription>
            Planification d&apos;une consultation avec synchronisation en temps réel sur l&apos;agenda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {/* ── Patient Combobox (Command Palette style) ── */}
          <div className="relative">
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Patient *
            </label>

            {selectedPatient ? (
              <div className="flex items-center justify-between p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {selectedPatient.firstName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    <p className="text-[10px] font-mono tabular-nums text-zinc-500">
                      CIN: {selectedPatient.cin} · {selectedPatient.phoneNumber}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPatientId('')
                    setIsSearchOpen(true)
                  }}
                  className="h-6 px-2 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                  Changer
                </Button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 stroke-[1.5]" />
                  <Input
                    placeholder="Rechercher par Nom, CIN ou Téléphone (+212)…"
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value)
                      setIsSearchOpen(true)
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    className="pl-8 text-xs font-mono"
                    autoFocus
                  />
                </div>

                {isSearchOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSearchOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
                      {isLoadingPatients ? (
                        <div className="p-3 text-center text-xs text-zinc-400">Chargement…</div>
                      ) : filteredPatients.length === 0 ? (
                        <div className="p-3 text-center text-xs text-zinc-400 space-y-2">
                          <p>Aucun patient trouvé avec ce critère.</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              closeModal()
                              openModal('new-patient')
                            }}
                            className="h-7 text-xs"
                          >
                            + Créer une nouvelle fiche patient
                          </Button>
                        </div>
                      ) : (
                        filteredPatients.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedPatientId(p.id)
                              setIsSearchOpen(false)
                            }}
                            className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                {p.firstName} {p.lastName}
                              </p>
                              <p className="text-[10px] font-mono tabular-nums text-zinc-500">
                                {p.phoneNumber} · CIN: {p.cin}
                              </p>
                            </div>
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {p.mutuelleType || 'Sans mutuelle'}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Médecin & Type ── */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Praticien
              </label>
              <select
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-700"
              >
                <option value="Dr. Rachid Amrani">Dr. Rachid Amrani</option>
                <option value="Dr. Amina Benjelloun">Dr. Amina Benjelloun</option>
                <option value="Dr. Mehdi Tazi">Dr. Mehdi Tazi</option>
                <option value="Dr. Youssef Alami">Dr. Youssef Alami</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Type de Rendez-vous
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AppointmentType)}
                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-700 font-mono"
              >
                <option value="CONSULTATION">CONSULTATION (Standard)</option>
                <option value="CONTROLE">CONTRÔLE (Suivi)</option>
                <option value="URGENCE">URGENCE</option>
              </select>
            </div>
          </div>

          {/* ── Date, Heure & Durée ── */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="font-mono tabular-nums text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Heure début
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono tabular-nums focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-700"
              >
                {TIME_OPTIONS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Durée
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono tabular-nums focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-700"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
          </div>

          {/* Computed interval indicator */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500">
            <span>Créneau programmé:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">
              {startTime} — {computeEndTime(startTime, durationMinutes)} (Casablanca)
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Motif / Notes cliniques (Optionnel)
            </label>
            <Input
              placeholder="Ex: Douleurs thoraciques, renouvellement ordonnance…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={closeModal}
              disabled={createAppointment.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!selectedPatientId || createAppointment.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 gap-1.5"
            >
              {createAppointment.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[1.5]" />
                  <span>Enregistrement…</span>
                </>
              ) : (
                <span>Confirmer le RDV</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
