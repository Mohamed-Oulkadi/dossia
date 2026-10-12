import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export type FormType = 'CNSS' | 'CNOPS' | 'FAR'
export type FeuilleDeSoinsStatus = 'DRAFT' | 'PRINTED'

export interface FeuilleDeSoinsResponse {
  id: string
  patientId: string
  patientName: string
  cin: string
  cnssNumber?: string | null
  consultationId?: string | null
  invoiceId?: string | null
  totalAmountPaid: number
  formType: FormType
  generatedAt: string
  status: FeuilleDeSoinsStatus
}

export interface FeuilleDeSoinsGenerateRequest {
  patientId: string
  invoiceId?: string | null
  consultationId?: string | null
  formType?: FormType
}

/**
 * Fetch previously generated Feuilles de Soins for a specific patient
 */
export function usePatientFeuillesDeSoins(patientId?: string) {
  return useQuery<FeuilleDeSoinsResponse[]>({
    queryKey: ['cnss', 'patient', patientId],
    queryFn: async () => {
      if (!patientId) return []
      const response = await apiClient.get<FeuilleDeSoinsResponse[]>(`/cnss/patient/${patientId}`)
      return response.data
    },
    enabled: Boolean(patientId),
    staleTime: 30_000,
  })
}

/**
 * 1-Click Feuille de Soins (AMO) generation mutation
 */
export function useGenerateFeuilleDeSoins() {
  const queryClient = useQueryClient()

  return useMutation<FeuilleDeSoinsResponse, Error, FeuilleDeSoinsGenerateRequest>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<FeuilleDeSoinsResponse>('/cnss/generate', payload)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cnss', 'patient', data.patientId] })
      toast.success('Feuille de Soins AMO générée avec succès !')
    },
    onError: (err) => {
      toast.error('Erreur lors de la génération de la feuille de soins : ' + err.message)
    },
  })
}

/**
 * Open official Moroccan AMO Feuille de Soins PDF directly in a new print tab
 */
export async function openCnssPdfInPrintTab(feuilleId: string): Promise<void> {
  try {
    const response = await apiClient.get(`/cnss/${feuilleId}/pdf`, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const blobUrl = URL.createObjectURL(blob)

    const newWindow = window.open(blobUrl, '_blank')
    if (!newWindow) {
      // Fallback: download if popups are blocked
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `feuille_de_soins_${feuilleId.slice(0, 8)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
  } catch (error) {
    console.error('Erreur lors du téléchargement de la feuille de soins PDF:', error)
    toast.error('Impossible d’ouvrir la Feuille de Soins PDF.')
  }
}
