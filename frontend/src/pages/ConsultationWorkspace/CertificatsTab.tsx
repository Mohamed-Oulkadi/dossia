import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  useCreateCertificate,
  downloadCertificatePdf,
  type MedicalCertificateType,
  type MedicalCertificateResponse,
} from '@/hooks/use-clinical-library'
import { toast } from 'sonner'
import {
  Calendar,
  Printer,
  FileCheck,
  ShieldCheck,
  Loader2,
} from 'lucide-react'

interface CertificatsTabProps {
  consultationId?: string
  patientName: string
}

const DURATION_CHIPS = [1, 2, 3, 5, 7, 10, 15, 21, 30]

export function CertificatsTab({ consultationId, patientName }: CertificatsTabProps) {
  const [certType, setCertType] = useState<MedicalCertificateType>('ARRET_TRAVAIL')
  const [reason, setReason] = useState("État fébrile d'origine virale")
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [durationDays, setDurationDays] = useState(3)
  const [isProlongation, setIsProlongation] = useState(false)
  const [customNotes, setCustomNotes] = useState('Repos strict à domicile.')
  const [createdCerts, setCreatedCerts] = useState<MedicalCertificateResponse[]>([])

  const createCertificate = useCreateCertificate(consultationId)

  // Calculate calculated end date for display
  const endDate = useMemo(() => {
    if (!startDate || durationDays <= 0) return ''
    const start = new Date(startDate)
    start.setDate(start.getDate() + (durationDays - 1))
    return start.toISOString().split('T')[0]
  }, [startDate, durationDays])

  const handleTypeChange = (type: MedicalCertificateType) => {
    setCertType(type)
    if (type === 'ARRET_TRAVAIL') {
      setReason("État fébrile d'origine virale")
      setCustomNotes('Repos strict à domicile.')
    } else if (type === 'APTITUDE') {
      setReason("Certificat d'aptitude physique et de bonne santé")
      setCustomNotes('Ne présente aucun signe clinique apparent de contre-indication.')
    } else if (type === 'PRESENCE') {
      setReason('Consultation médicale au cabinet')
      setCustomNotes('Présence constatée pour motifs médicaux.')
    } else if (type === 'DISPENSE_SPORT') {
      setReason("Inaptitude temporaire à la pratique d'activités physiques et sportives")
      setCustomNotes('Dispense valable pour les cours d’éducation physique et sportive.')
    }
  }

  const handleGenerateCertificate = async () => {
    if (!consultationId) {
      toast.info('Veuillez d’abord enregistrer la consultation pour générer le certificat officiel.')
      return
    }

    if (!reason.trim()) {
      toast.error('Le motif du certificat est obligatoire.')
      return
    }

    try {
      const res = await createCertificate.mutateAsync({
        type: certType,
        reason: reason.trim(),
        startDate,
        durationDays: certType === 'ARRET_TRAVAIL' || certType === 'DISPENSE_SPORT' ? durationDays : 1,
        isProlongation,
        customNotes: customNotes.trim() || undefined,
      })

      setCreatedCerts((prev) => [res, ...prev])
      await downloadCertificatePdf(res.id, patientName, res.type)
    } catch {
      // Handled by hook
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Certificate Type Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg text-xs font-semibold">
        <button
          type="button"
          onClick={() => handleTypeChange('ARRET_TRAVAIL')}
          className={`py-1.5 px-2 rounded-md transition-all cursor-pointer text-center ${
            certType === 'ARRET_TRAVAIL'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          Arrêt de Travail
        </button>

        <button
          type="button"
          onClick={() => handleTypeChange('APTITUDE')}
          className={`py-1.5 px-2 rounded-md transition-all cursor-pointer text-center ${
            certType === 'APTITUDE'
              ? 'bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          Aptitude Physique
        </button>

        <button
          type="button"
          onClick={() => handleTypeChange('PRESENCE')}
          className={`py-1.5 px-2 rounded-md transition-all cursor-pointer text-center ${
            certType === 'PRESENCE'
              ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          Présence Cabinet
        </button>

        <button
          type="button"
          onClick={() => handleTypeChange('DISPENSE_SPORT')}
          className={`py-1.5 px-2 rounded-md transition-all cursor-pointer text-center ${
            certType === 'DISPENSE_SPORT'
              ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          Dispense de Sport
        </button>
      </div>

      {/* ── Certificate Details Box ── */}
      <div className="p-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3.5 shadow-2xs">
        <div>
          <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Motif / Constat médical *
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Syndrome viral aigu avec asthénie majeure…"
            className="h-8 text-xs font-medium"
            required
          />
        </div>

        {/* Duration & Dates (if Arrêt de travail or Dispense) */}
        {(certType === 'ARRET_TRAVAIL' || certType === 'DISPENSE_SPORT') && (
          <div className="space-y-3 pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Date de début (inclus)
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 text-xs font-mono font-semibold"
                  />
                  <Calendar className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Nombre de jours de repos
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    max={180}
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 1)}
                    className="h-8 text-xs font-mono font-semibold tabular-nums pr-12"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 pointer-events-none">
                    jours
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Duration Chips */}
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Durées usuelles 1-Click :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_CHIPS.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDurationDays(days)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      durationDays === days
                        ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                    }`}
                  >
                    +{days} {days === 1 ? 'jour' : 'jours'}
                  </button>
                ))}
              </div>
            </div>

            {/* Prolongation Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isProlongation}
                  onChange={(e) => setIsProlongation(e.target.checked)}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  Il s&apos;agit d&apos;une prolongation d&apos;arrêt de travail
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Custom Notes */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Mentions complémentaires / Remarques du praticien
          </label>
          <Input
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Ex: Sorties autorisées entre 10h et 16h…"
            className="h-8 text-xs"
          />
        </div>

        {/* ── Anti-fraud Live Preview Alert ── */}
        <div className="p-3 rounded-md bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Formulation Légale Conforme (Code de Déontologie Marocain) :</span>
          </div>
          <p className="text-[11px] text-zinc-700 dark:text-zinc-300 italic font-serif leading-relaxed">
            &laquo; Je soussigné(e), Dr. Amina Benjelloun, certifie avoir examiné ce jour{' '}
            <strong className="font-semibold">{patientName || 'le patient'}</strong>, et atteste que son état de
            santé {certType === 'ARRET_TRAVAIL' ? (
              <>
                nécessite un repos de <strong className="font-semibold">{durationDays} jour(s)</strong> à compter du{' '}
                <strong className="font-semibold">{startDate}</strong> jusqu&apos;au{' '}
                <strong className="font-semibold">{endDate}</strong> inclus (sauf complications ultérieures).
              </>
            ) : certType === 'APTITUDE' ? (
              'ne présente aucune contre-indication clinique apparente à la pratique sportive ou professionnelle.'
            ) : certType === 'PRESENCE' ? (
              'a nécessité sa présence au cabinet ce jour pour une consultation médicale.'
            ) : (
              `justifie une dispense d'activités physiques de ${durationDays} jour(s).`
            )} &raquo;
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            size="sm"
            onClick={handleGenerateCertificate}
            disabled={createCertificate.isPending || !reason.trim()}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1.5 cursor-pointer shadow-2xs"
          >
            {createCertificate.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Génération…</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5" />
                <span>Générer le Certificat (PDF A4)</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Created Certificates in this session ── */}
      {createdCerts.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
            Certificats délivrés pour cette consultation ({createdCerts.length}):
          </span>
          <div className="space-y-1.5">
            {createdCerts.map((cert) => (
              <div
                key={cert.id}
                className="p-2.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Certificat {cert.type === 'ARRET_TRAVAIL' ? 'Arrêt de Travail' : cert.type}
                  </span>
                  <Badge variant="outline" className="font-mono text-[9px]">
                    {cert.durationDays} jour(s) ({cert.durationDaysWords})
                  </Badge>
                  {cert.isProlongation && (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] py-0">
                      Prolongation
                    </Badge>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCertificatePdf(cert.id, patientName, cert.type)}
                  className="h-7 text-xs gap-1 border-zinc-300 dark:border-zinc-800"
                >
                  <Printer className="w-3 h-3" />
                  <span>Réimprimer</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
