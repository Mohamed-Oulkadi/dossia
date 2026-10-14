import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  useCreateBilan,
  downloadBilanPdf,
  type DiagnosticRequestType,
  type DiagnosticRequestResponse,
} from '@/hooks/use-clinical-library'
import { toast } from 'sonner'
import {
  TestTube2,
  Scan,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Loader2,
  FileText,
} from 'lucide-react'

interface BilansTabProps {
  consultationId?: string
  patientName: string
}

const COMMON_BIOLOGIE = [
  'NFS / Hémogramme complet',
  'CRP Quantitative',
  'Glycémie à jeun',
  'HbA1c (Hémoglobine glyquée)',
  'Bilan lipidique (CT, HDL, LDL, TG)',
  'Créatinine sanguine & Urée',
  'Bilan hépatique (ASAT, ALAT, GGT, PAL)',
  'TSH ultra-sensible',
  'Ionogramme sanguin (Na+, K+, Cl-)',
  'ECBU avec Antibiogramme',
  'Ferritine sérique',
  'Vitamine D (25-OH-D)',
  'TP / INR (Bilan hémostase)',
  'Uricémie',
]

const COMMON_RADIOLOGIE = [
  'Radiographie thoracique face',
  'Échographie abdomino-pelvienne',
  'Échographie abdominale complète',
  'TDM / Scanner abdomino-pelvien',
  'IRM lombaire / rachis',
  'Échographie thyroïdienne',
  'Échodoppler veineux des membres inférieurs',
  'Radiographie genou face + profil',
  'Mammographie bilatérale + Échographie',
  'Radiographie panoramique dentaire',
]

export function BilansTab({ consultationId, patientName }: BilansTabProps) {
  const [examType, setExamType] = useState<DiagnosticRequestType>('BIOLOGIE')
  const [selectedExams, setSelectedExams] = useState<string[]>([])
  const [customExamInput, setCustomExamInput] = useState('')
  const [clinicalContext, setClinicalContext] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [createdBilans, setCreatedBilans] = useState<DiagnosticRequestResponse[]>([])

  const createBilan = useCreateBilan(consultationId)

  const commonPresets = examType === 'BIOLOGIE' ? COMMON_BIOLOGIE : COMMON_RADIOLOGIE

  const toggleExam = (exam: string) => {
    setSelectedExams((prev) =>
      prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]
    )
  }

  const addCustomExam = () => {
    if (!customExamInput.trim()) return
    const trimmed = customExamInput.trim()
    if (!selectedExams.includes(trimmed)) {
      setSelectedExams((prev) => [...prev, trimmed])
    }
    setCustomExamInput('')
  }

  const handleGenerateBilan = async () => {
    if (!consultationId) {
      toast.info('Veuillez d’abord valider ou enregistrer la consultation pour générer la demande officielle.')
      return
    }

    if (selectedExams.length === 0) {
      toast.error('Veuillez sélectionner au moins un examen.')
      return
    }

    try {
      const res = await createBilan.mutateAsync({
        type: examType,
        items: selectedExams,
        clinicalContext: clinicalContext.trim() || undefined,
        isUrgent,
      })

      setCreatedBilans((prev) => [res, ...prev])
      await downloadBilanPdf(res.id, patientName, res.type)
    } catch {
      // Handled in hook / interceptor
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Sub-Tab Selector: Biologie vs Radiologie ── */}
      <div className="flex items-center justify-between p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg">
        <div className="grid grid-cols-2 gap-1 flex-1">
          <button
            type="button"
            onClick={() => {
              setExamType('BIOLOGIE')
              setSelectedExams([])
            }}
            className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              examType === 'BIOLOGIE'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <TestTube2 className="w-3.5 h-3.5" />
            <span>Biologie Médicale</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setExamType('RADIOLOGIE')
              setSelectedExams([])
            }}
            className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              examType === 'RADIOLOGIE'
                ? 'bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Imagerie &amp; Radiologie</span>
          </button>
        </div>
      </div>

      {/* ── Top Presets Checklist ── */}
      <div className="p-3.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
            Examens Fréquents ({examType === 'BIOLOGIE' ? 'Analyses Biologiques' : 'Imagerie Médicale'})
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            {selectedExams.length} sélectionné(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {commonPresets.map((exam) => {
            const isChecked = selectedExams.includes(exam)
            return (
              <button
                key={exam}
                type="button"
                onClick={() => toggleExam(exam)}
                className={`text-left px-2.5 py-1.5 rounded border text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 dark:bg-zinc-900/40'
                }`}
              >
                <span className="truncate">{exam}</span>
                {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 ml-1.5" />}
              </button>
            )
          })}
        </div>

        {/* Custom Exam Input */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
          <Input
            value={customExamInput}
            onChange={(e) => setCustomExamInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustomExam()
              }
            }}
            placeholder="Ajouter un autre examen personnalisé (ex: Calprotectine fécale)…"
            className="h-7 text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomExam}
            className="h-7 px-2.5 text-xs text-zinc-700 dark:text-zinc-300 gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Ajouter</span>
          </Button>
        </div>
      </div>

      {/* ── Selected Exams Summary ── */}
      {selectedExams.length > 0 && (
        <div className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/30 space-y-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            Liste de la demande ({selectedExams.length}) :
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedExams.map((exam) => (
              <Badge
                key={exam}
                variant="secondary"
                className="text-xs py-0.5 pl-2 pr-1 gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
              >
                <span className="truncate max-w-[220px]">{exam}</span>
                <button
                  type="button"
                  onClick={() => toggleExam(exam)}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 stroke-[1.5]" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* ── Clinical Context & Urgent Toggle ── */}
      <div className="p-3.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
        <div>
          <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Renseignements Cliniques / Indication Médicale
          </label>
          <Input
            value={clinicalContext}
            onChange={(e) => setClinicalContext(e.target.value)}
            placeholder="Ex: Suspicion d'anémie ferriprive, colique néphrétique droite fébrile, bilan préopératoire…"
            className="h-8 text-xs font-medium"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="rounded border-zinc-300 text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
            />
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Examen à réaliser en URGENCE
            </span>
          </label>

          <Button
            type="button"
            size="sm"
            onClick={handleGenerateBilan}
            disabled={createBilan.isPending || selectedExams.length === 0}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1.5 cursor-pointer shadow-2xs"
          >
            {createBilan.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Génération…</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5" />
                <span>Générer la Demande (PDF A4)</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Created Bilans in this consultation ── */}
      {createdBilans.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
            Demandes émises pour cette séance ({createdBilans.length}):
          </span>
          <div className="space-y-1.5">
            {createdBilans.map((bilan) => (
              <div
                key={bilan.id}
                className="p-2.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Demande de {bilan.type === 'BIOLOGIE' ? 'Biologie' : 'Radiologie'}
                  </span>
                  <Badge variant="outline" className="font-mono text-[9px]">
                    {bilan.items.length} examen(s)
                  </Badge>
                  {bilan.isUrgent && (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[9px] py-0">
                      Urgent
                    </Badge>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadBilanPdf(bilan.id, patientName, bilan.type)}
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
