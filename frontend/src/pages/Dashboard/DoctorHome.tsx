import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useDailyAgenda,
  useUpdateAppointmentStatus,
  type Appointment,
} from '@/hooks/use-agenda'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Stethoscope,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileText,
  CreditCard,
  Pill,
  Phone,
  ShieldCheck,
} from 'lucide-react'

export function DoctorHome() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [selectedDate] = useState<string>(todayStr)

  const { data: appointments = [], isLoading } = useDailyAgenda(selectedDate)
  const updateStatusMutation = useUpdateAppointmentStatus()

  // Waiting Room Patients (status EN_ATTENTE)
  const waitingPatients = appointments.filter((a) => a.status === 'EN_ATTENTE')
  const inConsultationPatient = appointments.find((a) => a.status === 'EN_CONSULTATION')
  const completedAppointments = appointments.filter((a) => a.status === 'TERMINE')

  // Estimated revenue for completed consultations (default 350 MAD consultation tarif)
  const estimatedHonorairesMAD = completedAppointments.length * 350

  const handleCallPatient = (apt: Appointment) => {
    updateStatusMutation.mutate(
      { id: apt.id, status: 'EN_CONSULTATION', date: selectedDate },
      {
        onSuccess: () => {
          toast.success(`Patient appelé : ${apt.patientName}`, {
            description: 'Ouverture du cockpit clinique et du dossier médical.',
          })
          navigate(`/app/consultation?patientId=${apt.patientId}&appointmentId=${apt.id}`)
        },
      }
    )
  }

  const handleResumeActiveConsultation = () => {
    if (inConsultationPatient) {
      navigate(
        `/app/consultation?patientId=${inConsultationPatient.patientId}&appointmentId=${inConsultationPatient.id}`
      )
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-5 space-y-5">
      {/* Top Banner: Doctor Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Cockpit Médical · Dr. {user ? `${user.firstName} ${user.lastName}` : 'Rachid Amrani'}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              Espace Praticien
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            File d&apos;attente active, consultations cliniques et prescription conforme INPE / CNDP Loi 09-08.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => navigate('/app/consultations')}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer gap-1.5 shadow-2xs"
          >
            <Stethoscope className="w-3.5 h-3.5 stroke-[2]" />
            Espace Clinique
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/app/patients')}
            className="h-8 text-xs font-medium cursor-pointer gap-1.5"
          >
            <Users className="w-3.5 h-3.5 stroke-[1.5]" />
            Dossiers Patients
          </Button>
        </div>
      </div>

      {/* Doctor Clinical KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Waiting Room Count */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium">En Salle d&apos;Attente</span>
            <span className="relative flex h-2.5 w-2.5">
              {waitingPatients.length > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${waitingPatients.length > 0 ? 'bg-amber-500' : 'bg-zinc-400'}`} />
            </span>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {waitingPatients.length}
            </span>
            <span className="text-xs text-zinc-500">
              patient{waitingPatients.length > 1 ? 's' : ''} en attente
            </span>
          </div>
        </div>

        {/* KPI 2: Completed Consultations */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium">Consultations Terminées</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {completedAppointments.length}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              sur {appointments.length} programmés
            </span>
          </div>
        </div>

        {/* KPI 3: Estimated Daily Act Honoraires */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium">Honoraires Estimés du Jour</span>
            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {estimatedHonorairesMAD.toLocaleString('fr-MA')}
            </span>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
              MAD
            </span>
          </div>
        </div>
      </div>

      {/* Active Consultation Banner (if a patient is currently in the doctor's room) */}
      {inConsultationPatient && (
        <div className="p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <span>Consultation en cours : {inConsultationPatient.patientName}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  {inConsultationPatient.type}
                </span>
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                Débutée à {inConsultationPatient.startTime} · Examen clinique ou prescription en attente
              </div>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleResumeActiveConsultation}
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer gap-1.5"
          >
            Reprendre la Consultation
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Main Waiting Room Queue Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              File d&apos;Attente Active (Salle d&apos;Attente)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
              {waitingPatients.length} prêt{waitingPatients.length > 1 ? 's' : ''}
            </span>
          </div>

          <span className="text-[11px] text-zinc-500">
            Patients pointés à l&apos;accueil par le secrétariat
          </span>
        </div>

        {/* Patients Queue List */}
        <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">
              Synchronisation de la salle d&apos;attente…
            </div>
          ) : waitingPatients.length === 0 ? (
            <div className="py-10 text-center space-y-1">
              <div className="w-10 h-10 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Users className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Salle d&apos;attente vide
              </div>
              <div className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                Aucun patient en attente pour le moment. Dès que le secrétariat pointe une arrivée, elle apparaîtra ici instantanément.
              </div>
            </div>
          ) : (
            waitingPatients.map((apt, index) => (
              <div
                key={apt.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
              >
                {/* Left: Patient Position & Details */}
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                    {index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {apt.patientName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        {apt.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-zinc-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-zinc-400" />
                        {apt.patientPhone}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Clock className="w-3 h-3" />
                        RDV prévu : {apt.startTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Call Patient in Consultation CTA */}
                <div className="flex items-center gap-2 sm:self-center">
                  <Button
                    size="sm"
                    onClick={() => handleCallPatient(apt)}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer gap-1.5 shadow-2xs"
                  >
                    <Stethoscope className="w-3.5 h-3.5 stroke-[2]" />
                    Appeler en Consultation
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              Conformité ordonnance : Tout acte et prescription est tracé sous l&apos;INPE du praticien connecté.
            </span>
          </div>
          <span className="font-mono text-[11px] tabular-nums">
            {waitingPatients.length} en attente
          </span>
        </div>
      </div>

      {/* Quick Access to Clinical Resources */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/app/consultations')}
          className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Espace Clinique & Diagnostics
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Observations médicales, constantes vitales et antécédents.
          </p>
        </button>

        <button
          onClick={() => navigate('/app/ordonnances')}
          className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Prescriptions & Ordonnances A4
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Génération et impression conforme aux posologies marocaines.
          </p>
        </button>

        <button
          onClick={() => navigate('/app/cnss')}
          className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Feuilles de Soins CNSS / AMO
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Bordereaux de remboursement et nomenclature officielle des actes.
          </p>
        </button>
      </div>
    </div>
  )
}
export default DoctorHome
