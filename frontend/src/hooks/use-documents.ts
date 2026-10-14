import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export type DocumentCategory =
  | 'BIOLOGIE'
  | 'RADIOLOGIE_IMAGERIE'
  | 'COMPTE_RENDU'
  | 'ADMINISTRATIF_CNSS'

export type VisibilityLevel = 'DOCTOR_ONLY' | 'SHARED_SECRETARY'

export interface PatientDocument {
  id: string
  clinicId: string
  patientId: string
  consultationId?: string | null
  originalFilename: string
  contentType: string
  fileSizeBytes: number
  objectKey: string
  category: DocumentCategory
  visibilityLevel: VisibilityLevel
  description?: string | null
  createdAt: string
  createdBy: string
}

export interface UploadDocumentParams {
  patientId: string
  consultationId?: string | null
  category: DocumentCategory
  description?: string | null
  file: File
}

/**
 * Fetch all documents for a patient (filtered by backend role: Doctor vs Secretary)
 */
export function usePatientDocuments(patientId: string | undefined) {
  return useQuery<PatientDocument[]>({
    queryKey: ['patient-documents', patientId],
    queryFn: async () => {
      if (!patientId) return []
      const response = await apiClient.get<PatientDocument[]>(`/documents/patient/${patientId}`)
      return response.data
    },
    enabled: Boolean(patientId),
  })
}

/**
 * Upload a document to the MinIO Medical Vault
 */
export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ patientId, consultationId, category, description, file }: UploadDocumentParams) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('patientId', patientId)
      formData.append('category', category)
      if (consultationId) formData.append('consultationId', consultationId)
      if (description) formData.append('description', description)

      const response = await apiClient.post<PatientDocument>('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', data.patientId] })
      toast.success('Document sécurisé dans le coffre-fort', {
        description: `${data.originalFilename} (${data.category}) archivé avec succès.`,
      })
    },
    onError: (err: any) => {
      const message = err.response?.data?.detail || err.message || "Erreur lors de l'upload du document."
      toast.error("Échec de l'archivage", { description: message })
    },
  })
}

/**
 * Soft-delete a document per CNDP audit trail rules
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      await apiClient.delete(`/documents/${id}`)
      return { id, patientId }
    },
    onSuccess: ({ patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', patientId] })
      toast.success('Document archivé', {
        description: 'Le document a été retiré conformément aux règles d’archivage CNDP.',
      })
    },
    onError: (err: any) => {
      const message = err.response?.data?.detail || err.message || 'Erreur lors de la suppression.'
      toast.error('Erreur', { description: message })
    },
  })
}

/**
 * Secure Axios blob fetcher that streams document with JWT Authorization
 * and safely revokes the ObjectURL on unmount to prevent browser memory leaks.
 */
export function useDocumentBlobUrl(documentId: string | null) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!documentId) {
      setBlobUrl(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let isSubscribed = true
    let createdUrl: string | null = null

    setIsLoading(true)
    setError(null)

    apiClient
      .get(`/documents/${documentId}/stream`, {
        responseType: 'blob',
      })
      .then((response) => {
        if (!isSubscribed) return
        createdUrl = URL.createObjectURL(response.data)
        setBlobUrl(createdUrl)
        setIsLoading(false)
      })
      .catch((err) => {
        if (!isSubscribed) return
        const detail = err.response?.data?.detail || err.message || 'Impossible de charger le document.'
        setError(detail)
        setIsLoading(false)
      })

    return () => {
      isSubscribed = false
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl)
      }
    }
  }, [documentId])

  return { blobUrl, isLoading, isError: Boolean(error), error }
}
