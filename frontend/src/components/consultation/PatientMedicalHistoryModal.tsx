import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  usePatientConsultations,
  downloadOrdonnancePdf,
  type ConsultationResponse,
  type PrescriptionItem,
} from '@/hooks/use-consultations'
import type { Patient } from '@/hooks/use-patients'
import {
  History,
  Activity,
  Heart,
  Scale,
  Calendar,
  Pill,
  Printer,
  Copy,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface PatientMedicalHistoryModalProps {
  patient: Patient | null
  isOpen: boolean
  onClose: () => void
  onRenewPrescription?: (items: PrescriptionItem[]) => void
}

export function PatientMedicalHistoryModal({
  patient,
  isOpen,
  onClose,
  onRenewPrescription,
}: PatientMedicalHistoryModalProps) {
  const [expandedConsultationId, setExpandedConsultationId] = useState<string | null>(null)
  const [isPrintingId, setIsPrintingId] = useState<string | null>(null)

  const { data: consultations = [], isLoading, isError, refetch } = usePatientConsultations(patient?.id)

  if (!patient) return null

  // Sort consultations newest first
  const sortedConsultations = [...consultations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const latestConsultation = sortedConsultations[0]

  const handlePrintPdf = async (consultation: ConsultationResponse) => {
    setIsPrintingId(consultation.id)
    try {
      await downloadOrdonnancePdf(
        consultation.id,
        `${patient.firstName}_${patient.lastName}`
      )
    } finally {
      setIsPrintingId(null)
    }
  }

  const handleRenew = (consultation: ConsultationResponse) => {
    if (!consultation.prescription?.items || consultation.prescription.items.length === 0) {
      toast.info('Aucun médicament dans cette consultation passée.')
      return
    }
    if (onRenewPrescription) {
      onRenewPrescription(consultation.prescription.items)
      onClose()
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedConsultationId((prev) => (prev === id ? null : id))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* ── Dialog Header ── */}
        <DialogHeader className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <History className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Dossier Historique &amp; Consultations Passées</span>
                  <Badge variant="outline" className="font-mono text-[10px] py-0">
                    {consultations.length} séance{consultations.length > 1 ? 's' : ''}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {patient.lastName.toUpperCase()} {patient.firstName}
                  </span>
                  <span>·</span>
                  <span className="font-mono">CIN: {patient.cin}</span>
                  <span>·</span>
                  <span className="font-mono">Tél: {patient.phoneNumber}</span>
                  <span>·</span>
                  <Badge variant="secondary" className="text-[10px] py-0 px-1 font-mono">
                    {patient.mutuelleType || 'Sans mutuelle'}
                  </Badge>
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── Quick Vitals & Summary Strip (if consultations exist) ── */}
        {latestConsultation && (
          <div className="px-5 py-2.5 bg-emerald-50/40 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between flex-shrink-0 text-xs">
            <span className="text-[11px] font-medium text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Dernières Constantes Connues ({new Date(latestConsultation.createdAt).toLocaleDateString('fr-MA')}) :
            </span>

            <div className="flex items-center gap-4 font-mono text-[11px] tabular-nums">
              {latestConsultation.bloodPressure && (
                <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                  <Heart className="w-3 h-3 text-rose-500" />
                  <strong>TA : {latestConsultation.bloodPressure}</strong>
                </span>
              )}
              {latestConsultation.weightKg && (
                <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                  <Scale className="w-3 h-3 text-sky-500" />
                  <strong>Poids : {latestConsultation.weightKg} kg</strong>
                </span>
              )}
              {latestConsultation.heartRateBpm && (
                <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                  <Activity className="w-3 h-3 text-amber-500" />
                  <strong>Pouls : {latestConsultation.heartRateBpm} bpm</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Modal Body / Timeline ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs">Chargement de l&apos;historique médical…</span>
            </div>
          )}

          {isError && (
            <div className="py-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-xs text-rose-600 dark:text-rose-400">
                Impossible de charger les consultations passées.
              </p>
              <Button size="sm" variant="outline" onClick={() => refetch()} className="text-xs">
                Réessayer
              </Button>
            </div>
          )}

          {!isLoading && !isError && sortedConsultations.length === 0 && (
            <div className="py-14 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Aucune consultation passée
                </h3>
                <p className="text-[11px] text-zinc-500 max-w-sm mx-auto mt-0.5">
                  Ce patient n&apos;a pas encore de séance enregistrée. Les consultations saisies dans l&apos;espace clinique apparaîtront automatiquement ici.
                </p>
              </div>
            </div>
          )}

          {/* ── Vertical Timeline ── */}
          {!isLoading && !isError && sortedConsultations.length > 0 && (
            <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3.5 space-y-5">
              {sortedConsultations.map((consultation, index) => {
                const isExpanded =
                  expandedConsultationId === consultation.id ||
                  (expandedConsultationId === null && index === 0)
                const rxCount = consultation.prescription?.items?.length || 0

                return (
                  <div key={consultation.id} className="relative pl-6 group">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 bg-white dark:bg-zinc-950 transition-colors ${
                        index === 0
                          ? 'border-emerald-600 dark:border-emerald-400'
                          : 'border-zinc-400 dark:border-zinc-600'
                      }`}
                    />

                    {/* Timeline Card */}
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors overflow-hidden">
                      {/* Card Header */}
                      <div
                        onClick={() => toggleExpand(consultation.id)}
                        className="px-4 py-2.5 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-zinc-900/90 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="flex items-center gap-1 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            {new Date(consultation.createdAt).toLocaleDateString('fr-MA', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">
                            {new Date(consultation.createdAt).toLocaleTimeString('fr-MA', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          <Badge
                            variant="secondary"
                            className="text-[10px] font-medium py-0 px-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          >
                            {consultation.motif}
                          </Badge>

                          {rxCount > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono py-0 text-zinc-600 dark:text-zinc-400"
                            >
                              <Pill className="w-3 h-3 mr-1 text-emerald-600 inline" />
                              {rxCount} Rx
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {consultation.diagnosis && (
                            <span className="hidden sm:inline text-xs font-medium text-emerald-700 dark:text-emerald-400 truncate max-w-xs">
                              Diag: {consultation.diagnosis}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-700"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Card Expanded Content */}
                      {isExpanded && (
                        <div className="p-4 space-y-3.5 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                          {/* Diagnostic & Vitals row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 rounded bg-slate-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/60">
                            <div>
                              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                                Diagnostic retenu
                              </span>
                              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                                {consultation.diagnosis || 'Non spécifié'}
                              </p>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                                Constantes de la séance
                              </span>
                              <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums mt-0.5 text-zinc-700 dark:text-zinc-300">
                                <span>TA: <strong>{consultation.bloodPressure || '—'}</strong></span>
                                <span>Poids: <strong>{consultation.weightKg ? `${consultation.weightKg} kg` : '—'}</strong></span>
                                <span>Pouls: <strong>{consultation.heartRateBpm ? `${consultation.heartRateBpm} bpm` : '—'}</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Clinical Notes */}
                          {consultation.clinicalNotes && (
                            <div>
                              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                                Observations &amp; Examen Clinique
                              </span>
                              <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed bg-white dark:bg-zinc-900 p-2.5 rounded border border-zinc-200/80 dark:border-zinc-800">
                                {consultation.clinicalNotes}
                              </p>
                            </div>
                          )}

                          {/* Prescribed Medications (Ordonnance) */}
                          {consultation.prescription?.items && consultation.prescription.items.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 flex items-center gap-1">
                                  <Pill className="w-3 h-3 text-emerald-600" />
                                  Ordonnance Prescrite ({consultation.prescription.items.length} médicament(s))
                                </span>
                              </div>

                              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                {consultation.prescription.items.map((item, i) => (
                                  <div
                                    key={i}
                                    className="p-2.5 bg-white dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                                  >
                                    <div>
                                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        {item.medicationName}
                                      </span>
                                      {item.instructions && (
                                        <p className="text-[11px] text-zinc-500 mt-0.5">
                                          {item.instructions}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[10px]">
                                      <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700">
                                        {item.dosage}
                                      </Badge>
                                      <Badge variant="secondary" className="bg-slate-100 dark:bg-zinc-800">
                                        {item.duration}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions Row */}
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                            <span className="text-[11px] text-zinc-400 font-mono">
                              Réf: {consultation.id.substring(0, 8)}…
                            </span>

                            <div className="flex items-center gap-2">
                              {/* Print PDF Button */}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isPrintingId === consultation.id}
                                onClick={() => handlePrintPdf(consultation)}
                                className="h-7 px-2.5 text-xs gap-1.5 border-zinc-300 dark:border-zinc-700 hover:bg-slate-50 cursor-pointer"
                              >
                                {isPrintingId === consultation.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                                ) : (
                                  <Printer className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                                )}
                                <span>Imprimer Ordonnance (PDF)</span>
                              </Button>

                              {/* Renew Button (if in consultation workspace) */}
                              {onRenewPrescription && rxCount > 0 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleRenew(consultation)}
                                  className="h-7 px-2.5 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-2xs"
                                  title="Copier les médicaments vers l'ordonnance active"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Renouveler Prescription</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
