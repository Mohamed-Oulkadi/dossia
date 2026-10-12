import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type PaymentMethod = 'ESPECES' | 'TPE' | 'CHEQUE' | 'VIREMENT'
export type InvoiceStatus = 'PAYE' | 'NON_PAYE' | 'PARTIEL'

export interface PaymentResponse {
  id: string
  invoiceId: string
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string | null
  paymentDate: string
  createdAt: string
}

export interface InvoiceResponse {
  id: string
  patientId: string
  patientName: string
  consultationId?: string | null
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  status: InvoiceStatus
  issueDate: string
  payments: PaymentResponse[]
  createdAt: string
}

export interface DailyLedgerSummary {
  date: string
  totalCash: number
  totalTpe: number
  totalCheck: number
  totalTransfer: number
  totalGlobal: number
  transactionCount: number
}

export interface DailyLedgerItem {
  paymentId: string
  invoiceId: string
  patientId: string
  patientName: string
  cin?: string | null
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string | null
  paymentDate: string
}

export interface DailyLedgerResponse {
  summary: DailyLedgerSummary
  transactions: DailyLedgerItem[]
}

export interface DirectPaymentRequest {
  patientId: string
  consultationId?: string | null
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string | null
}

export interface PaymentCreateRequest {
  invoiceId: string
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string | null
}

export interface InvoiceCreateRequest {
  patientId: string
  consultationId?: string | null
  totalAmount: number
}

/**
 * Format currency into standard Moroccan French notation: 1 500,00 MAD
 */
export function formatMAD(amount: number | string | null | undefined): string {
  const numeric = typeof amount === 'number' ? amount : parseFloat(String(amount || 0))
  if (isNaN(numeric)) return '0,00 MAD'

  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric)

  return `${formatted} MAD`
}

/**
 * Fetch daily cash ledger summary and transaction rows for a specific date (YYYY-MM-DD)
 */
export function useDailyLedger(date?: string) {
  return useQuery<DailyLedgerResponse>({
    queryKey: ['billing', 'ledger', date || 'today'],
    queryFn: async () => {
      const response = await apiClient.get<DailyLedgerResponse>('/billing/ledger', {
        params: date ? { date } : undefined,
      })
      return response.data
    },
    staleTime: 10_000,
  })
}

/**
 * Fetch pending unpaid or partially paid invoices
 */
export function usePendingInvoices(patientId?: string) {
  return useQuery<InvoiceResponse[]>({
    queryKey: ['billing', 'pending', patientId || 'all'],
    queryFn: async () => {
      const response = await apiClient.get<InvoiceResponse[]>('/billing/invoices/pending', {
        params: patientId ? { patientId } : undefined,
      })
      return response.data
    },
    staleTime: 30_000,
  })
}

/**
 * Fast 1-step encaissement mutation (3-Second SLA)
 * Automatically invalidates both ['billing', 'ledger'] and ['agenda']
 */
export function useDirectEncaissement() {
  const queryClient = useQueryClient()

  return useMutation<InvoiceResponse, Error, DirectPaymentRequest>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<InvoiceResponse>('/billing/direct-encaissement', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] })
      queryClient.invalidateQueries({ queryKey: ['agenda'] })
    },
  })
}

/**
 * Apply payment to an existing invoice
 */
export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation<PaymentResponse, Error, PaymentCreateRequest>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<PaymentResponse>('/billing/payments', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] })
      queryClient.invalidateQueries({ queryKey: ['agenda'] })
    },
  })
}

/**
 * Create a new invoice
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation<InvoiceResponse, Error, InvoiceCreateRequest>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<InvoiceResponse>('/billing/invoices', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] })
    },
  })
}

/**
 * Download or stream the official Moroccan Reçu Note d'Honoraires PDF
 */
export async function downloadReceiptPdf(invoiceId: string, openInNewTab = true): Promise<void> {
  const response = await apiClient.get(`/billing/invoices/${invoiceId}/receipt`, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data], { type: 'application/pdf' })
  const blobUrl = URL.createObjectURL(blob)

  if (openInNewTab) {
    const newWindow = window.open(blobUrl, '_blank')
    if (!newWindow) {
      triggerDownload(blobUrl, `recu_${invoiceId.slice(0, 8)}.pdf`)
    }
  } else {
    triggerDownload(blobUrl, `recu_${invoiceId.slice(0, 8)}.pdf`)
  }

  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
