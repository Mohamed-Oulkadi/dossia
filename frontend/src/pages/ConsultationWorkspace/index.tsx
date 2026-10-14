/**
 * ConsultationWorkspace — The Doctor's Clinical Workspace (Cabinet Médical)
 * Two-Column High-Density Layout with Clinical Speed Engine:
 * - Left Column: Patient Vitals (Tension Artérielle, Poids, FC) & Observations Cliniques / Diagnostic
 * - Right Column: 3-Tab Speed Engine
 *   • Tab 1: Ordonnance Médicale (Moroccan drug catalog combobox, 1-click protocol injector, posology auto-fill)
 *   • Tab 2: Demandes de Bilans (Biologie & Radiologie 1-click bundles, A4 PDF generator)
 *   • Tab 3: Certificats Médicaux (Moroccan anti-fraud spelled-out days, duration chips, A4 PDF generator)
 * - Moroccan Terminology, Strict MAD non-floating currency, CNDP 09-08 Compliance
 */
import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { usePatients } from '@/hooks/use-patients'
import { useDailyAgenda, useUpdateAppointmentStatus } from '@/hooks/use-agenda'
import {
  useCreateConsultation,
  downloadOrdonnancePdf,
  type ConsultationCreatePayload,
} from '@/hooks/use-consultations'
import {
  usePrescriptionTemplates,
  type PrescriptionTemplate,
} from '@/hooks/use-clinical-library'
import { MedicationCombobox } from './MedicationCombobox'
import { SaveTemplateModal } from './SaveTemplateModal'
import { BilansTab } from './BilansTab'
import { CertificatsTab } from './CertificatsTab'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Stethoscope,
  Printer,
  CheckCircle2,
  ArrowLeft,
  Plus,
  Trash2,
  Heart,
  Scale,
  Activity,
  Loader2,
  Pill,
  Sparkles,
  BookmarkPlus,
  TestTube2,
  Award,
  Zap,
} from 'lucide-react'

interface PrescriptionItemForm {
  medicationName: string
  dosage: string
  duration: string
  instructions: string
}

interface ConsultationFormData {
  patientId: string
  appointmentId?: string
  motif: string
  clinicalNotes: string
  diagnosis: string
  bloodPressure: string
  weightKg: string
  heartRateBpm: string
  prescriptionNotes: string
  items: PrescriptionItemForm[]
}

const COMMON_MEDICATIONS = [
  'Doliprane 1000mg cp',
  'Amoxicilline 1g cp',
  'Augmentin 1g/125mg cp',
  'Aspegic 100mg sachet',
  'Inexium 20mg gélule',
  'Co-Aprovel 150/12.5mg cp',
  'Glucophage 850mg cp',
  'Célestène 2mg cp',
  'Aerius 5mg cp',
  'Spasfon 80mg cp',
]

type SpeedTab = 'ORDONNANCE' | 'BILANS' | 'CERTIFICATS'

export default function ConsultationWorkspace() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const appointmentId = searchParams.get('appointmentId') || undefined
  const initialPatientId = searchParams.get('patientId') || ''

  // Active right column tab
  const [activeTab, setActiveTab] = useState<SpeedTab>('ORDONNANCE')
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false)

  // Live Patient & Appointment queries
  const { data: patientsPage, isLoading: isLoadingPatients } = usePatients(0, 100)
  const { data: agendaAppointments = [] } = useDailyAgenda()
  const { data: templates = [] } = usePrescriptionTemplates()

  const createConsultation = useCreateConsultation()
  const updateAppointmentStatus = useUpdateAppointmentStatus()

  // Find linked appointment if any
  const linkedAppointment = useMemo(() => {
    if (!appointmentId) return undefined
    return agendaAppointments.find((a) => a.id === appointmentId)
  }, [agendaAppointments, appointmentId])

  // Active patient selection
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatientId || linkedAppointment?.patientId || ''
  )

  const selectedPatient = useMemo(() => {
    if (!patientsPage?.content) return undefined
    return patientsPage.content.find((p) => p.id === selectedPatientId)
  }, [patientsPage?.content, selectedPatientId])

  // Last saved consultation for instant PDF printing
  const [lastSavedConsultationId, setLastSavedConsultationId] = useState<string | null>(null)

  // React Hook Form with dynamic medication lines
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConsultationFormData>({
    defaultValues: {
      patientId: selectedPatientId,
      appointmentId: appointmentId || '',
      motif: linkedAppointment?.type === 'URGENCE' ? 'Consultation Urgence' : 'Consultation de suivi',
      clinicalNotes: '',
      diagnosis: '',
      bloodPressure: '12/8',
      weightKg: '72',
      heartRateBpm: '74',
      prescriptionNotes: 'Boire abondamment. Repos conseillé.',
      items: [
        {
          medicationName: 'Doliprane 1000mg cp',
          dosage: '1 comprimé 3 fois par jour',
          duration: '5 jours',
          instructions: 'En cas de douleur ou fièvre, espacer de 6h',
        },
      ],
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items',
  })

  // Watch items for template modal and display
  const watchedItems = watch('items')

  // Apply prescription template in 1 click
  const handleApplyTemplate = (template: PrescriptionTemplate) => {
    if (!template.items || template.items.length === 0) return

    replace(
      template.items.map((item) => ({
        medicationName: item.medicationName,
        dosage: item.dosage,
        duration: item.duration,
        instructions: item.instructions || '',
      }))
    )

    toast.success(`Protocole "${template.title}" appliqué`, {
      description: `${template.items.length} médicament(s) injecté(s) avec posologie officielle`,
    })
  }

  // Submit consultation
  const onSubmit = async (data: ConsultationFormData) => {
    const activePatId = selectedPatientId || data.patientId
    if (!activePatId) {
      toast.error('Veuillez sélectionner un patient avant de valider la consultation.')
      return
    }

    const payload: ConsultationCreatePayload = {
      patientId: activePatId,
      appointmentId: appointmentId || undefined,
      motif: data.motif.trim(),
      clinicalNotes: data.clinicalNotes.trim() || undefined,
      diagnosis: data.diagnosis.trim() || undefined,
      bloodPressure: data.bloodPressure.trim() || undefined,
      weightKg: data.weightKg ? parseFloat(data.weightKg) : null,
      heartRateBpm: data.heartRateBpm ? parseInt(data.heartRateBpm, 10) : null,
      prescription: {
        notes: data.prescriptionNotes.trim() || undefined,
        items: data.items
          .filter((item) => item.medicationName.trim() !== '')
          .map((item) => ({
            medicationName: item.medicationName.trim(),
            dosage: item.dosage.trim(),
            duration: item.duration.trim(),
            instructions: item.instructions?.trim() || undefined,
          })),
      },
    }

    try {
      const response = await createConsultation.mutateAsync(payload)
      setLastSavedConsultationId(response.id)

      // Optionally transition appointment status to TERMINE
      if (appointmentId) {
        await updateAppointmentStatus.mutateAsync({
          id: appointmentId,
          status: 'TERMINE',
        })
      }

      toast.success('Consultation terminée et enregistrée', {
        description: 'Dossier archivé · Ordonnance prête pour impression',
      })
    } catch {
      // Error handled by Sonner via API client interceptor
    }
  }

  // Handle immediate PDF printing
  const handlePrintOrdonnance = async () => {
    if (lastSavedConsultationId && selectedPatient) {
      await downloadOrdonnancePdf(
        lastSavedConsultationId,
        `${selectedPatient.firstName}_${selectedPatient.lastName}`
      )
    } else {
      toast.info("Enregistrez d'abord la consultation pour générer l'ordonnance officielle signée.")
    }
  }

  const patientFullName = selectedPatient
    ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
    : 'Patient'

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-zinc-950">
      {/* ── Top Bar / Clinical Header ── */}
      <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between flex-shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app')}
            className="h-8 px-2 gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour Agenda</span>
          </Button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Espace Consultation &amp; Speed Engine
            </h1>
            <Badge variant="outline" className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
              Dr. Amina Benjelloun
            </Badge>
            {lastSavedConsultationId && (
              <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px] py-0">
                Séance Enregistrée <CheckCircle2 className="w-3 h-3 inline ml-1" />
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrintOrdonnance}
            className="h-8 gap-1.5 text-xs border-zinc-300 dark:border-zinc-800"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 stroke-[1.5]" />
            <span>Imprimer l&apos;Ordonnance (PDF)</span>
          </Button>

          <Button
            form="consultation-form"
            type="submit"
            size="sm"
            disabled={createConsultation.isPending}
            className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white border-0 font-medium cursor-pointer shadow-2xs"
          >
            {createConsultation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Enregistrement…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terminer la consultation</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Patient Identity Banner ── */}
      <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800/80 bg-slate-100/70 dark:bg-zinc-900/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-500">Patient:</span>
            {isLoadingPatients ? (
              <span className="text-zinc-400">Chargement…</span>
            ) : (
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value)
                  setValue('patientId', e.target.value)
                }}
                className="h-7 px-2 text-xs font-semibold rounded border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="">Sélectionner un patient…</option>
                {patientsPage?.content.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} (CIN: {p.cin})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedPatient && (
            <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums text-zinc-600 dark:text-zinc-400">
              <span>CIN: <strong className="text-zinc-800 dark:text-zinc-200">{selectedPatient.cin}</strong></span>
              <span>Tél: <strong className="text-zinc-800 dark:text-zinc-200">{selectedPatient.phoneNumber}</strong></span>
              <span>Né(e) le: <strong className="text-zinc-800 dark:text-zinc-200">{selectedPatient.birthDate}</strong></span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {selectedPatient.mutuelleType || 'Sans mutuelle'}
              </Badge>
            </div>
          )}
        </div>

        {linkedAppointment && (
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-zinc-400">Rendez-vous associé:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {new Date(linkedAppointment.startTime).toLocaleTimeString('fr-MA', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-zinc-500">({linkedAppointment.type})</span>
          </div>
        )}
      </div>

      {/* ── Main Two-Column Workspace ── */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
        {/* ── Left Column: Constantes Vitales & Examen Clinique (5 cols) ── */}
        <div className="lg:col-span-5 overflow-y-auto p-4 space-y-4 bg-white dark:bg-zinc-950">
          <form id="consultation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Examen Clinique &amp; Constantes
              </h2>
              <span className="text-[10px] text-zinc-400 font-mono">Loi CNDP 09-08</span>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-3 gap-2">
              {/* Tension */}
              <div className="p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/40 shadow-2xs">
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span className="text-[10px] font-medium uppercase">Tension</span>
                  <Activity className="w-3 h-3 text-rose-500 stroke-[1.5]" />
                </div>
                <div className="relative">
                  <Input
                    {...register('bloodPressure', {
                      pattern: {
                        value: /^$|^\d{1,3}\/\d{1,3}$/,
                        message: 'Ex: 12/8 ou 120/80',
                      },
                    })}
                    placeholder="12/8"
                    className="h-7 text-xs font-mono font-semibold tabular-nums pr-11"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-400 pointer-events-none">
                    mmHg
                  </span>
                </div>
                {errors.bloodPressure && (
                  <p className="text-[9px] text-rose-500 mt-1">{errors.bloodPressure.message}</p>
                )}
              </div>

              {/* Poids */}
              <div className="p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/40 shadow-2xs">
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span className="text-[10px] font-medium uppercase">Poids</span>
                  <Scale className="w-3 h-3 text-emerald-500 stroke-[1.5]" />
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    {...register('weightKg', {
                      min: { value: 0.5, message: '> 0.5 kg' },
                      max: { value: 400, message: '< 400 kg' },
                    })}
                    placeholder="70.5"
                    className="h-7 text-xs font-mono font-semibold tabular-nums pr-8"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-400 pointer-events-none">
                    kg
                  </span>
                </div>
                {errors.weightKg && (
                  <p className="text-[9px] text-rose-500 mt-1">{errors.weightKg.message}</p>
                )}
              </div>

              {/* Fréquence Cardiaque */}
              <div className="p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/40 shadow-2xs">
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span className="text-[10px] font-medium uppercase">Pouls / FC</span>
                  <Heart className="w-3 h-3 text-rose-500 stroke-[1.5]" />
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    {...register('heartRateBpm', {
                      min: { value: 30, message: 'Min 30' },
                      max: { value: 250, message: 'Max 250' },
                    })}
                    placeholder="72"
                    className="h-7 text-xs font-mono font-semibold tabular-nums pr-8"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-400 pointer-events-none">
                    bpm
                  </span>
                </div>
                {errors.heartRateBpm && (
                  <p className="text-[9px] text-rose-500 mt-1">{errors.heartRateBpm.message}</p>
                )}
              </div>
            </div>

            {/* Motif de Consultation */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Motif de consultation *
              </label>
              <Input
                {...register('motif', { required: 'Le motif est obligatoire' })}
                placeholder="Ex: Douleurs abdominales aiguës, rhinopharyngite, contrôle TA…"
                className="h-8 text-xs font-medium"
              />
              {errors.motif && (
                <p className="text-[10px] text-rose-500 mt-1">{errors.motif.message}</p>
              )}
            </div>

            {/* Observations Cliniques / Examen */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Observations Cliniques &amp; Anamnèse
              </label>
              <textarea
                {...register('clinicalNotes')}
                rows={6}
                placeholder="Examen physique: abdomen souple, absence de fièvre. Auscultation pulmonaire libre. Antécédents chirurgicaux non contributifs…"
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-700 font-sans leading-relaxed resize-none"
              />
            </div>

            {/* Diagnostic Retenu */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Diagnostic Médical Retenu
              </label>
              <Input
                {...register('diagnosis')}
                placeholder="Ex: Syndrome dyspeptique fonctionnel / Rhinopharyngite virale"
                className="h-8 text-xs font-medium"
              />
            </div>
          </form>
        </div>

        {/* ── Right Column: 3-Tab Speed Engine (7 cols) ── */}
        <div className="lg:col-span-7 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-zinc-900/20">
          {/* ── Speed Engine Main Tab Navigation ── */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 p-1 bg-zinc-200/70 dark:bg-zinc-800/60 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('ORDONNANCE')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'ORDONNANCE'
                    ? 'bg-white dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Ordonnance (Rx)</span>
                <Badge variant="secondary" className="text-[10px] py-0 px-1 font-mono">
                  {fields.length}
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('BILANS')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'BILANS'
                    ? 'bg-white dark:bg-zinc-950 text-sky-600 dark:text-sky-400 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <TestTube2 className="w-3.5 h-3.5" />
                <span>Demandes de Bilans</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('CERTIFICATS')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'CERTIFICATS'
                    ? 'bg-white dark:bg-zinc-950 text-purple-600 dark:text-purple-400 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Certificats Médicaux</span>
              </button>
            </div>

            {activeTab === 'ORDONNANCE' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSaveTemplateOpen(true)}
                className="h-7 text-[11px] gap-1 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                title="Enregistrer l'ordonnance actuelle comme modèle type"
              >
                <BookmarkPlus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Sauvegarder Modèle</span>
              </Button>
            )}
          </div>

          {/* ════ TAB 1: ORDONNANCE (Rx) ════ */}
          {activeTab === 'ORDONNANCE' && (
            <div className="space-y-3.5">
              {/* ── 1-Click Protocol Templates Injector Bar ── */}
              <div className="p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    Protocoles &amp; Ordonnances Types (1-Click) :
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400">
                    {templates.length} modèle(s) disponible(s)
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500 group-hover:text-emerald-600 transition-colors" />
                      <span>{tpl.title}</span>
                      <span className="text-[9px] font-mono text-zinc-400">({tpl.items.length})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Dynamic Medication Rows ── */}
              <div className="space-y-2.5">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-clinical-card space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-semibold text-zinc-500">
                        Ligne #{index + 1}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      )}
                    </div>

                    {/* Medication Combobox (Moroccan Catalog Autocomplete) */}
                    <div>
                      <MedicationCombobox
                        value={watch(`items.${index}.medicationName`) || ''}
                        onChange={(val) => setValue(`items.${index}.medicationName`, val)}
                        onSelectMedication={(item) => {
                          setValue(`items.${index}.medicationName`, item.brandName)
                          if (item.defaultPosology) {
                            setValue(`items.${index}.dosage`, item.defaultPosology)
                          }
                        }}
                      />
                    </div>

                    {/* Dosage & Duration Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          {...register(`items.${index}.dosage` as const, { required: true })}
                          placeholder="Posologie (ex: 1 cp 3x/jour)"
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <Input
                          {...register(`items.${index}.duration` as const, { required: true })}
                          placeholder="Durée (ex: 7 jours)"
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Specific Instructions */}
                    <div>
                      <Input
                        {...register(`items.${index}.instructions` as const)}
                        placeholder="Conseils de prise (ex: Pendant les repas, espacer de 6h)"
                        className="h-7 text-[11px] text-zinc-600 dark:text-zinc-400"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Add Button & Presets */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      medicationName: '',
                      dosage: '1 cp 2 fois par jour',
                      duration: '5 jours',
                      instructions: '',
                    })
                  }
                  className="w-full h-8 text-xs border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 text-zinc-700 dark:text-zinc-300 gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un médicament</span>
                </Button>

                {/* Common Presets Badges */}
                <div className="pt-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block mb-1.5">
                    Médicaments Fréquents (1-Click):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_MEDICATIONS.slice(0, 8).map((med) => (
                      <button
                        key={med}
                        type="button"
                        onClick={() =>
                          append({
                            medicationName: med,
                            dosage: '1 cp matin et soir',
                            duration: '7 jours',
                            instructions: 'Au cours des repas',
                          })
                        }
                        className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
                      >
                        + {med}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prescription General Notes / Recommandations */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Recommandations hygiéno-diététiques / Mentions ordonnance
                </label>
                <textarea
                  {...register('prescriptionNotes')}
                  rows={3}
                  placeholder="Conseils de repos, hydratation, contrôle de la tension dans 15 jours…"
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 resize-none font-sans"
                />
              </div>
            </div>
          )}

          {/* ════ TAB 2: DEMANDES DE BILANS ════ */}
          {activeTab === 'BILANS' && (
            <BilansTab
              consultationId={lastSavedConsultationId || undefined}
              patientName={patientFullName}
            />
          )}

          {/* ════ TAB 3: CERTIFICATS MÉDICAUX ════ */}
          {activeTab === 'CERTIFICATS' && (
            <CertificatsTab
              consultationId={lastSavedConsultationId || undefined}
              patientName={patientFullName}
            />
          )}
        </div>
      </div>

      {/* ── Modal to Save Custom Prescription Template ── */}
      <SaveTemplateModal
        isOpen={isSaveTemplateOpen}
        onClose={() => setIsSaveTemplateOpen(false)}
        items={watchedItems || []}
      />
    </div>
  )
}
