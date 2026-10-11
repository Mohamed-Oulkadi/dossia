import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export interface Patient {
  id: string
  firstName: string
  lastName: string
  cin: string
  phoneNumber: string
  birthDate: string
  cnssNumber?: string | null
  mutuelleType?: string | null
  createdAt: string
  updatedAt: string
}

export interface PatientCreateRequest {
  firstName: string
  lastName: string
  cin: string
  phoneNumber: string
  birthDate: string
  cnssNumber?: string
  mutuelleType?: string
}

export interface PatientUpdateRequest {
  firstName: string
  lastName: string
  cin: string
  phoneNumber: string
  birthDate: string
  cnssNumber?: string
  mutuelleType?: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

/**
 * Hook to fetch paginated list of patients from Spring Boot backend
 */
export function usePatients(page = 0, size = 20) {
  return useQuery<Page<Patient>>({
    queryKey: ['patients', page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<Page<Patient>>('/patients', {
        params: { page, size, sort: 'lastName,asc' },
      })
      return data
    },
  })
}

/**
 * Hook to create a new patient with automatic cache invalidation
 */
export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation<Patient, Error, PatientCreateRequest>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<Patient>('/patients', payload)
      return data
    },
    onSuccess: (newPatient) => {
      // Invalidate patients query to refresh data table instantly without full page reload
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success(
        `Dossier médical créé pour ${newPatient.firstName} ${newPatient.lastName}`,
        {
          description: `CIN: ${newPatient.cin} · Réf: ${newPatient.id.slice(0, 8)}`,
        }
      )
    },
  })
}
