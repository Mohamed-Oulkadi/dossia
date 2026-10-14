import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export interface MedicationCatalogItem {
  id: string
  brandName: string
  dci: string
  dosage: string
  form: string
  defaultPosology: string
  ppvMad: number
  isReimbursable: boolean
}

export interface TemplatePrescriptionItem {
  medicationName: string
  dosage: string
  duration: string
  instructions?: string
}

export interface PrescriptionTemplate {
  id: string
  clinicId?: string | null
  isDefault: boolean
  title: string
  category: string
  items: TemplatePrescriptionItem[]
}

export type DiagnosticRequestType = 'BIOLOGIE' | 'RADIOLOGIE'

export interface DiagnosticRequestCreatePayload {
  type: DiagnosticRequestType
  items: string[]
  clinicalContext?: string
  isUrgent?: boolean
}

export interface DiagnosticRequestResponse {
  id: string
  consultationId: string
  type: DiagnosticRequestType
  items: string[]
  clinicalContext?: string | null
  isUrgent: boolean
  createdAt: string
}

export type MedicalCertificateType = 'ARRET_TRAVAIL' | 'APTITUDE' | 'PRESENCE' | 'DISPENSE_SPORT'

export interface MedicalCertificateCreatePayload {
  type: MedicalCertificateType
  reason: string
  startDate: string
  durationDays: number
  isProlongation?: boolean
  customNotes?: string
}

export interface MedicalCertificateResponse {
  id: string
  consultationId: string
  type: MedicalCertificateType
  reason: string
  startDate: string
  endDate?: string | null
  durationDays: number
  durationDaysWords?: string | null
  isProlongation: boolean
  customNotes?: string | null
  createdAt: string
}

/**
 * Hook to search medications in the Moroccan catalog with 150ms debounce
 */
export function useMedicationSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 150)
    return () => clearTimeout(handler)
  }, [query])

  return useQuery<MedicationCatalogItem[]>({
    queryKey: ['medications', 'search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) return []
      const { data } = await apiClient.get<MedicationCatalogItem[]>('/consultations/catalog/medications', {
        params: { q: debouncedQuery.trim() },
      })
      return data
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 10,
  })
}

/**
 * Hook to fetch all available prescription templates (default national + custom clinic)
 */
export function usePrescriptionTemplates() {
  return useQuery<PrescriptionTemplate[]>({
    queryKey: ['prescription-templates'],
    queryFn: async () => {
      const { data } = await apiClient.get<PrescriptionTemplate[]>('/consultations/templates')
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to create a new custom prescription template for the current clinic
 */
export function useCreatePrescriptionTemplate() {
  const queryClient = useQueryClient()

  return useMutation<PrescriptionTemplate, Error, { title: string; category?: string; items: TemplatePrescriptionItem[] }>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<PrescriptionTemplate>('/consultations/templates', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescription-templates'] })
      toast.success("Modèle d'ordonnance enregistré")
    },
  })
}

/**
 * Hook to create a diagnostic request (Bilan Biologique ou Radiologique)
 */
export function useCreateBilan(consultationId?: string) {
  return useMutation<DiagnosticRequestResponse, Error, DiagnosticRequestCreatePayload>({
    mutationFn: async (payload) => {
      if (!consultationId) throw new Error('Veuillez d’abord enregistrer la consultation')
      const { data } = await apiClient.post<DiagnosticRequestResponse>(`/consultations/${consultationId}/bilans`, payload)
      return data
    },
    onSuccess: (res) => {
      toast.success(`Demande de bilan ${res.type === 'BIOLOGIE' ? 'biologique' : 'radiologique'} enregistrée`)
    },
  })
}

/**
 * Hook to create a medical certificate
 */
export function useCreateCertificate(consultationId?: string) {
  return useMutation<MedicalCertificateResponse, Error, MedicalCertificateCreatePayload>({
    mutationFn: async (payload) => {
      if (!consultationId) throw new Error('Veuillez d’abord enregistrer la consultation')
      const { data } = await apiClient.post<MedicalCertificateResponse>(`/consultations/${consultationId}/certificates`, payload)
      return data
    },
    onSuccess: (res) => {
      toast.success('Certificat médical généré avec succès', {
        description: `${res.durationDays} jour(s) (${res.durationDaysWords})`,
      })
    },
  })
}

/**
 * Helper to download official Moroccan Bilan PDF
 */
export async function downloadBilanPdf(bilanId: string, patientName: string, type: 'BIOLOGIE' | 'RADIOLOGIE' = 'BIOLOGIE') {
  try {
    toast.info("Génération de la demande d'examen PDF en cours…")

    const response = await apiClient.get(`/consultations/bilans/${bilanId}/pdf`, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const fileUrl = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = fileUrl
    const safeName = patientName.replace(/[^a-zA-Z0-9]/g, '_')
    link.download = `demande_${type.toLowerCase()}_${safeName}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      window.URL.revokeObjectURL(fileUrl)
    }, 5000)

    toast.success("Demande d'examen téléchargée avec succès")
  } catch (error) {
    toast.error("Impossible de générer le bilan PDF")
    console.error('Error downloading bilan PDF:', error)
  }
}

/**
 * Helper to download official Moroccan Medical Certificate PDF with anti-fraud spelled numbers
 */
export async function downloadCertificatePdf(certificateId: string, patientName: string, type: string = 'ARRET_TRAVAIL') {
  try {
    toast.info('Génération du certificat médical PDF en cours…')

    const response = await apiClient.get(`/consultations/certificates/${certificateId}/pdf`, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const fileUrl = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = fileUrl
    const safeName = patientName.replace(/[^a-zA-Z0-9]/g, '_')
    link.download = `certificat_${type.toLowerCase()}_${safeName}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      window.URL.revokeObjectURL(fileUrl)
    }, 5000)

    toast.success('Certificat médical téléchargé avec succès')
  } catch (error) {
    toast.error('Impossible de générer le certificat PDF')
    console.error('Error downloading certificate PDF:', error)
  }
}
