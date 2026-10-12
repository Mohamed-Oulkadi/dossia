import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useDirectEncaissement,
  downloadReceiptPdf,
  formatMAD,
  type PaymentMethod,
  type InvoiceResponse,
} from '@/hooks/use-billing'
import { usePatients, useUpdatePatient } from '@/hooks/use-patients'
import { useGenerateFeuilleDeSoins, openCnssPdfInPrintTab } from '@/hooks/use-cnss'
import {
  Banknote,
  CreditCard,
  FileText,
  Building,
  Printer,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileCheck2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId?: string
  patientName?: string
  consultationId?: string
  defaultAmount?: number
  onSuccess?: (invoice: InvoiceResponse) => void
}

const PRESET_AMOUNTS = [250, 300, 400, 500]

export function PaymentModal({
  open,
  onOpenChange,
  patientId: initialPatientId,
  patientName: initialPatientName,
  consultationId,
  defaultAmount = 300,
  onSuccess,
}: PaymentModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || '')
  const [amount, setAmount] = useState<number>(defaultAmount)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ESPECES')
  const [referenceNumber, setReferenceNumber] = useState<string>('')
  const [bankName, setBankName] = useState<string>('')
  const [completedInvoice, setCompletedInvoice] = useState<InvoiceResponse | null>(null)
  const [isPrinting, setIsPrinting] = useState<boolean>(false)
  const [cnssInput, setCnssInput] = useState<string>('')
  const [isSavingCnss, setIsSavingCnss] = useState<boolean>(false)
  const [isGeneratingAmo, setIsGeneratingAmo] = useState<boolean>(false)

  const { data: patientsPage } = usePatients(0, 50)
  const directEncaissement = useDirectEncaissement()
  const generateAmoMutation = useGenerateFeuilleDeSoins()
  const updatePatientMutation = useUpdatePatient()

  const currentPatient = patientsPage?.content.find(
    (p) => p.id === (completedInvoice?.patientId || selectedPatientId)
  )

  useEffect(() => {
    if (open) {
      setSelectedPatientId(initialPatientId || '')
      setAmount(defaultAmount)
      setPaymentMethod('ESPECES')
      setReferenceNumber('')
      setBankName('')
      setCompletedInvoice(null)
      setIsPrinting(false)
      setCnssInput('')
      setIsSavingCnss(false)
      setIsGeneratingAmo(false)
    }
  }, [open, initialPatientId, defaultAmount])

  const handleSaveCnss = async () => {
    if (!currentPatient || !cnssInput.trim()) return
    setIsSavingCnss(true)
    try {
      await updatePatientMutation.mutateAsync({
        id: currentPatient.id,
        payload: {
          firstName: currentPatient.firstName,
          lastName: currentPatient.lastName,
          cin: currentPatient.cin,
          phoneNumber: currentPatient.phoneNumber,
          birthDate: currentPatient.birthDate,
          cnssNumber: cnssInput.trim(),
          mutuelleType: currentPatient.mutuelleType || 'CNSS',
        },
      })
      setCnssInput('')
    } finally {
      setIsSavingCnss(false)
    }
  }

  const handleGenerateFeuilleDeSoins = async () => {
    if (!completedInvoice) return
    setIsGeneratingAmo(true)
    try {
      const res = await generateAmoMutation.mutateAsync({
        patientId: completedInvoice.patientId,
        invoiceId: completedInvoice.id,
        consultationId: completedInvoice.consultationId || null,
      })
      await openCnssPdfInPrintTab(res.id)
    } finally {
      setIsGeneratingAmo(false)
    }
  }

  const handlePresetClick = (val: number) => {
    setAmount(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatientId || amount <= 0) return

    let finalRef = referenceNumber.trim()
    if (paymentMethod === 'CHEQUE' && bankName.trim()) {
      finalRef = `${finalRef ? `N° ${finalRef}` : ''} (${bankName.trim()})`.trim()
    }

    try {
      const invoice = await directEncaissement.mutateAsync({
        patientId: selectedPatientId,
        consultationId: consultationId || null,
        amount,
        paymentMethod,
        referenceNumber: finalRef || null,
      })
      setCompletedInvoice(invoice)
      if (onSuccess) {
        onSuccess(invoice)
      }
    } catch {
      // Error handled by react-query / global interceptor
    }
  }

  const handlePrintReceipt = async () => {
    if (!completedInvoice) return
    setIsPrinting(true)
    try {
      await downloadReceiptPdf(completedInvoice.id, true)
    } finally {
      setIsPrinting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setCompletedInvoice(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[460px] p-5">
        <DialogHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <DialogTitle className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {completedInvoice ? "Reçu d'encaissement & AMO" : 'Encaisser une prestation'}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            {completedInvoice
              ? 'Le paiement a été validé et comptabilisé dans la caisse.'
              : 'Enregistrement rapide au comptoir (Espèces, TPE, Chèque).'
            }
          </DialogDescription>
        </DialogHeader>

        {completedInvoice ? (
          <div className="py-4 space-y-3.5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            </div>

            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Paiement enregistré avec succès !
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {completedInvoice.patientName} — {formatMAD(completedInvoice.totalAmount)}
              </p>
            </div>

            <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 font-mono space-y-1">
              <div className="flex justify-between">
                <span>Règlement :</span>
                <span className="font-semibold">{completedInvoice.payments[0]?.paymentMethod || 'ESPECES'}</span>
              </div>
              <div className="flex justify-between">
                <span>Montant perçu :</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatMAD(completedInvoice.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reste à payer :</span>
                <span className="tabular-nums">0,00 MAD</span>
              </div>
            </div>

            {/* Data Completeness Guard: Missing CNSS Number Warning */}
            {currentPatient && !currentPatient.cnssNumber && (
              <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-left space-y-2">
                <div className="flex items-start gap-1.5 text-amber-800 dark:text-amber-300 text-[11px] font-medium">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 stroke-[1.5]" />
                  <span>
                    Attention : Le numéro d'immatriculation CNSS est manquant pour ce patient. Veuillez le renseigner avant de générer le formulaire.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Input
                    placeholder="Ex: 102938475"
                    value={cnssInput}
                    onChange={(e) => setCnssInput(e.target.value)}
                    className="h-7 text-xs font-mono"
                  />
                  <Button
                    size="sm"
                    type="button"
                    className="h-7 px-2.5 text-xs bg-amber-600 hover:bg-amber-700 text-white shrink-0 cursor-pointer"
                    onClick={handleSaveCnss}
                    disabled={isSavingCnss || !cnssInput.trim()}
                  >
                    {isSavingCnss ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Enregistrer'}
                  </Button>
                </div>
              </div>
            )}

            {/* 1-Click Feuille de Soins (AMO) Action */}
            <Button
              variant="outline"
              className="w-full h-8.5 text-xs border-teal-400 dark:border-teal-700 bg-teal-50/60 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 cursor-pointer disabled:opacity-50"
              onClick={handleGenerateFeuilleDeSoins}
              disabled={isGeneratingAmo || !currentPatient?.cnssNumber}
            >
              {isGeneratingAmo ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <FileCheck2 className="w-3.5 h-3.5 mr-1.5 text-teal-600 dark:text-teal-400 stroke-[1.5]" />
              )}
              Générer Feuille de Soins (AMO)
            </Button>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 h-8 text-xs cursor-pointer"
                onClick={handlePrintReceipt}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                )}
                Imprimer le Reçu (PDF)
              </Button>
              <Button
                className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                onClick={handleClose}
              >
                Terminer
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Patient Selector if not prefilled */}
            {!initialPatientId ? (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Patient <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  <option value="">Sélectionner un patient...</option>
                  {patientsPage?.content.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} {p.cin ? `(${p.cin})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400">Patient</span>
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {initialPatientName || 'Patient sélectionné'}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Comptoir
                </span>
              </div>
            )}

            {/* Montant & Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Montant à encaisser (MAD) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                  {formatMAD(amount)}
                </span>
              </div>

              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="h-9 text-sm font-mono font-semibold tabular-nums pr-12"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-zinc-400 pointer-events-none">
                  MAD
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handlePresetClick(val)}
                    className={cn(
                      'flex-1 py-1 text-[11px] font-mono rounded border transition-all cursor-pointer tabular-nums',
                      amount === val
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                    )}
                  >
                    {val} DH
                  </button>
                ))}
              </div>
            </div>

            {/* Mode de Règlement Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Mode de règlement <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'ESPECES', label: 'Espèces', icon: Banknote },
                  { id: 'TPE',     label: 'TPE',     icon: CreditCard },
                  { id: 'CHEQUE',  label: 'Chèque',  icon: FileText },
                  { id: 'VIREMENT',label: 'Virement',icon: Building },
                ].map((item) => {
                  const Icon = item.icon
                  const isSelected = paymentMethod === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                      className={cn(
                        'flex flex-col items-center justify-center py-2 px-1 rounded-md border text-[11px] font-medium transition-all cursor-pointer',
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                      )}
                    >
                      <Icon className="w-4 h-4 mb-1 stroke-[1.5]" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Dynamic Check & TPE Inputs */}
            {paymentMethod === 'CHEQUE' && (
              <div className="p-2.5 rounded-md bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-[11px] font-medium">
                  <AlertCircle className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Détails du chèque bancaire</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-medium">
                      N° Chèque <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="Ex: 7482910"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="h-8 text-xs font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-medium">
                      Banque émettrice
                    </label>
                    <Input
                      placeholder="Ex: Attijariwafa, BCP..."
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'TPE' && (
              <div className="p-2.5 rounded-md bg-blue-500/5 border border-blue-500/20 space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase font-medium">
                  N° Ticket / Réf. Autorisation (Optionnel)
                </label>
                <Input
                  placeholder="Ex: AUTH-82914"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            )}

            {paymentMethod === 'VIREMENT' && (
              <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase font-medium">
                  Référence de virement (Optionnel)
                </label>
                <Input
                  placeholder="Ex: VIR-20261012-01"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs cursor-pointer"
                onClick={handleClose}
                disabled={directEncaissement.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="h-8 px-3.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
                disabled={directEncaissement.isPending || !selectedPatientId || amount <= 0}
              >
                {directEncaissement.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Banknote className="w-3.5 h-3.5 mr-1.5 stroke-[1.5]" />
                )}
                <span>Encaisser {formatMAD(amount)}</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
