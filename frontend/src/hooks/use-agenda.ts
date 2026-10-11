import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export type AppointmentStatus =
  | 'EN_ATTENTE'
  | 'EN_CONSULTATION'
  | 'TERMINE'
  | 'ANNULE'
  | 'NO_SHOW'

export type AppointmentType = 'CONSULTATION' | 'CONTROLE' | 'URGENCE'

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientPhone: string
  doctorName: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  type: AppointmentType
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface AppointmentCreateRequest {
  patientId: string
  doctorName: string
  startTime: string
  endTime: string
  type?: AppointmentType
  notes?: string
}

export interface AppointmentStatusUpdatePayload {
  id: string
  status: AppointmentStatus
  date?: string
}

/**
 * Hook to fetch daily schedule from Spring Boot backend (Moroccan Africa/Casablanca time)
 */
export function useDailyAgenda(date?: string, doctorName?: string) {
  return useQuery<Appointment[]>({
    queryKey: ['agenda', date, doctorName],
    queryFn: async () => {
      const { data } = await apiClient.get<Appointment[]>('/agenda', {
        params: {
          date: date || undefined,
          doctorName: doctorName || undefined,
        },
      })
      return data
    },
  })
}

/**
 * Hook to schedule a new appointment with instant cache invalidation
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation<Appointment, Error, AppointmentCreateRequest>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<Appointment>('/agenda', payload)
      return data
    },
    onSuccess: (newAppointment) => {
      // Invalidate agenda query cache to refresh time-grid without page reload
      queryClient.invalidateQueries({ queryKey: ['agenda'] })
      toast.success(
        `Rendez-vous planifié avec succès pour ${newAppointment.patientName}`,
        {
          description: `Dr. ${newAppointment.doctorName} · Statut: En attente`,
        }
      )
    },
  })
}

/**
 * Hook to quickly transition appointment status (e.g., waiting room -> consultation)
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()

  return useMutation<Appointment, Error, AppointmentStatusUpdatePayload>({
    mutationFn: async ({ id, status }) => {
      const { data } = await apiClient.patch<Appointment>(`/agenda/${id}/status`, {
        status,
      })
      return data
    },
    onSuccess: (updatedAppointment) => {
      // Instantly invalidate agenda cache
      queryClient.invalidateQueries({ queryKey: ['agenda'] })

      const statusLabels: Record<AppointmentStatus, string> = {
        EN_ATTENTE: "En salle d'attente",
        EN_CONSULTATION: 'En consultation (au cabinet)',
        TERMINE: 'Consultation terminée',
        ANNULE: 'Rendez-vous annulé',
        NO_SHOW: 'Patient absent (No-Show)',
      }

      toast.success(`Statut mis à jour: ${statusLabels[updatedAppointment.status]}`, {
        description: `${updatedAppointment.patientName} (${updatedAppointment.type})`,
      })
    },
  })
}
