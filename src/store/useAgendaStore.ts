import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Appointment } from '@/types/moroccan'
import { MOCK_PATIENTS } from '@/types/moroccan'

// Generate mock appointments for today
const today = new Date().toISOString().split('T')[0]

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-001',
    patientId: MOCK_PATIENTS[0].id,
    doctorId: 'doc-001',
    date: today,
    heureDebut: '08:30',
    heureFin: '09:00',
    motif: 'Consultation générale',
    status: 'Terminé',
  },
  {
    id: 'appt-002',
    patientId: MOCK_PATIENTS[1].id,
    doctorId: 'doc-001',
    date: today,
    heureDebut: '09:30',
    heureFin: '10:00',
    motif: 'Renouvellement ordonnance',
    status: 'En consultation',
  },
  {
    id: 'appt-003',
    patientId: MOCK_PATIENTS[2].id,
    doctorId: 'doc-001',
    date: today,
    heureDebut: '10:00',
    heureFin: '10:30',
    motif: 'Douleurs lombaires',
    status: 'Confirmé',
  },
  {
    id: 'appt-004',
    patientId: MOCK_PATIENTS[3].id,
    doctorId: 'doc-001',
    date: today,
    heureDebut: '11:00',
    heureFin: '11:30',
    motif: 'Bilan annuel',
    status: 'Confirmé',
  },
  {
    id: 'appt-005',
    patientId: MOCK_PATIENTS[4].id,
    doctorId: 'doc-001',
    date: today,
    heureDebut: '14:00',
    heureFin: '14:30',
    motif: 'Fièvre et maux de tête',
    status: 'En attente',
  },
  {
    id: 'appt-006',
    patientId: MOCK_PATIENTS[0].id,
    doctorId: 'doc-001',
    date: today,
    heureDebut: '15:30',
    heureFin: '16:00',
    motif: 'Suivi traitement',
    status: 'Annulé',
  },
]

interface AgendaState {
  appointments: Appointment[]
  selectedDate: string
  selectedAppointmentId: string | null

  setSelectedDate: (date: string) => void
  selectAppointment: (id: string | null) => void
  addAppointment: (appt: Appointment) => void
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void
}

export const useAgendaStore = create<AgendaState>()(
  devtools(
    (set) => ({
      appointments: MOCK_APPOINTMENTS,
      selectedDate: today,
      selectedAppointmentId: null,

      setSelectedDate: (date) => set({ selectedDate: date }),
      selectAppointment: (id) => set({ selectedAppointmentId: id }),
      addAppointment: (appt) =>
        set((s) => ({ appointments: [...s.appointments, appt] })),
      updateAppointmentStatus: (id, status) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        })),
    }),
    { name: 'dossia-agenda' }
  )
)
