import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export interface PrescriptionItem {
  medicationName: string
  dosage: string
  duration: string
  instructions?: string
}

export interface PrescriptionCreatePayload {
  notes?: string
  items: PrescriptionItem[]
}

export interface PrescriptionResponse {
  id: string
  consultationId: string
  notes?: string | null
  items: PrescriptionItem[]
  createdAt: string
}

export interface ConsultationCreatePayload {
  patientId: string
  appointmentId?: string
  motif: string
  clinicalNotes?: string
  diagnosis?: string
  bloodPressure?: string
  weightKg?: number | null
  heartRateBpm?: number | null
  prescription?: PrescriptionCreatePayload
}

export interface ConsultationResponse {
  id: string
  patientId: string
  patientName: string
  patientAge?: number | null
  appointmentId?: string | null
  motif: string
  clinicalNotes?: string | null
  diagnosis?: string | null
  bloodPressure?: string | null
  weightKg?: number | null
  heartRateBpm?: number | null
  prescription?: PrescriptionResponse | null
  createdAt: string
}

/**
 * Hook to retrieve a single consultation by ID
 */
export function useConsultation(id?: string) {
  return useQuery<ConsultationResponse>({
    queryKey: ['consultation', id],
    queryFn: async () => {
      if (!id) throw new Error('ID manquant')
      const { data } = await apiClient.get<ConsultationResponse>(`/consultations/${id}`)
      return data
    },
    enabled: !!id,
  })
}

/**
 * Hook to retrieve a patient's clinical history
 */
export function usePatientConsultations(patientId?: string) {
  return useQuery<ConsultationResponse[]>({
    queryKey: ['consultations', 'patient', patientId],
    queryFn: async () => {
      if (!patientId) return []
      const { data } = await apiClient.get<ConsultationResponse[]>(`/consultations/patient/${patientId}`)
      return data
    },
    enabled: !!patientId,
  })
}

/**
 * Hook to save a new clinical consultation with attached prescription
 */
export function useCreateConsultation() {
  const queryClient = useQueryClient()

  return useMutation<ConsultationResponse, Error, ConsultationCreatePayload>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<ConsultationResponse>('/consultations', payload)
      return data
    },
    onSuccess: (newConsultation) => {
      // Invalidate queries so agenda and history views refresh instantly
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      queryClient.invalidateQueries({ queryKey: ['agenda'] })

      toast.success(`Consultation enregistrée avec succès`, {
        description: `${newConsultation.patientName} · Diagnostic: ${newConsultation.diagnosis || 'Non renseigné'}`,
      })
    },
  })
}

/**
 * Utility to download or view the official A4 Moroccan Medical Prescription PDF
 */
export async function downloadOrdonnancePdf(consultationId: string, patientName: string) {
  try {
    toast.info("Génération de l'ordonnance médicale PDF en cours…")

    const response = await apiClient.get(`/consultations/${consultationId}/ordonnance/pdf`, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const fileUrl = window.URL.createObjectURL(blob)

    // Open in a new tab for instant printing, and trigger download
    const link = document.createElement('a')
    link.href = fileUrl
    const safeName = patientName.replace(/[^a-zA-Z0-9]/g, '_')
    link.download = `ordonnance_${safeName}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      window.URL.revokeObjectURL(fileUrl)
    }, 5000)

    toast.success("Ordonnance téléchargée avec succès")
  } catch (error) {
    toast.error("Impossible de générer l'ordonnance PDF")
    console.error('Error downloading ordonnance PDF:', error)
  }
}
