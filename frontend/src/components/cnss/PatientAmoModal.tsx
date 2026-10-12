import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  usePatientFeuillesDeSoins,
  useGenerateFeuilleDeSoins,
  openCnssPdfInPrintTab,
  type FormType,
  type FeuilleDeSoinsResponse,
} from '@/hooks/use-cnss'
import { useUpdatePatient, type Patient } from '@/hooks/use-patients'
import {
  FileText,
  Printer,
  FileCheck2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  CreditCard,
} from 'lucide-react'
import { toast } from 'sonner'

interface PatientAmoModalProps {
  patient: Patient | null
  isOpen: boolean
  onClose: () => void
}

export function PatientAmoModal({ patient, isOpen, onClose }: PatientAmoModalProps) {
  const [cnssInput, setCnssInput] = useState('')
  const [selectedFormType, setSelectedFormType] = useState<FormType>('CNSS')
  const [isPrintingId, setIsPrintingId] = useState<string | null>(null)

  const { data: feuilles = [], isLoading, refetch } = usePatientFeuillesDeSoins(patient?.id)
  const generateMutation = useGenerateFeuilleDeSoins()
  const updatePatientMutation = useUpdatePatient()

  useEffect(() => {
    if (patient) {
      setCnssInput(patient.cnssNumber || '')
      if (patient.mutuelleType === 'CNOPS') setSelectedFormType('CNOPS')
      else if (patient.mutuelleType === 'FAR') setSelectedFormType('FAR')
      else setSelectedFormType('CNSS')
    }
  }, [patient])

  if (!patient) return null

  const handleSaveCnss = async () => {
    if (!cnssInput.trim()) return
    try {
      await updatePatientMutation.mutateAsync({
        id: patient.id,
        payload: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          cin: patient.cin,
          phoneNumber: patient.phoneNumber,
          birthDate: patient.birthDate,
          cnssNumber: cnssInput.trim(),
          mutuelleType: patient.mutuelleType || 'CNSS',
        },
      })
      toast.success('Numéro CNSS/AMO enregistré avec succès')
    } catch {
      toast.error('Erreur lors de l’enregistrement du numéro CNSS')
    }
  }

  const handleGenerate = async () => {
    if (!patient.cnssNumber && !cnssInput.trim()) {
      toast.error('Veuillez renseigner le numéro CNSS du patient avant de générer la feuille de soins')
      return
    }

    try {
      // If CNSS was edited inline but not yet saved, save it first
      if (cnssInput.trim() && cnssInput.trim() !== patient.cnssNumber) {
        await updatePatientMutation.mutateAsync({
          id: patient.id,
          payload: {
            firstName: patient.firstName,
            lastName: patient.lastName,
            cin: patient.cin,
            phoneNumber: patient.phoneNumber,
            birthDate: patient.birthDate,
            cnssNumber: cnssInput.trim(),
            mutuelleType: patient.mutuelleType || 'CNSS',
          },
        })
      }

      const res = await generateMutation.mutateAsync({
        patientId: patient.id,
        formType: selectedFormType,
      })

      // Immediately open the newly generated PDF for the secretary
      await openCnssPdfInPrintTab(res.id)
    } catch {
      // Error handled by mutation toast
    }
  }

  const handlePrint = async (feuille: FeuilleDeSoinsResponse) => {
    setIsPrintingId(feuille.id)
    try {
      await openCnssPdfInPrintTab(feuille.id)
    } finally {
      setIsPrintingId(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                <FileCheck2 className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Dossier AMO &amp; Feuilles de Soins
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Génération et historique des formulaires d'assurance maladie (CNSS, CNOPS, FAR).
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Patient Identity Strip */}
        <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Patient</span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {patient.lastName.toUpperCase()} {patient.firstName}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">CIN</span>
              <p className="font-mono text-zinc-700 dark:text-zinc-300">{patient.cin}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Mutuelle</span>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">
                {patient.mutuelleType || 'Non spécifiée'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300/40 dark:border-zinc-700">
              INPE: 102938475
            </span>
          </div>
        </div>

        {/* CNSS Number Guard */}
        {!patient.cnssNumber && !cnssInput.trim() ? (
          <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 stroke-[1.5]" />
              <div>
                <p className="font-medium">Numéro d'immatriculation CNSS manquant</p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                  Pour imprimer une Feuille de Soins valide pour l'ANAM/CNSS, veuillez renseigner le numéro d'immatriculation du patient.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Input
                placeholder="Ex: 102938475"
                value={cnssInput}
                onChange={(e) => setCnssInput(e.target.value)}
                className="h-8 text-xs font-mono max-w-xs"
              />
              <Button
                size="sm"
                className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleSaveCnss}
                disabled={updatePatientMutation.isPending || !cnssInput.trim()}
              >
                {updatePatientMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-md bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <CreditCard className="w-4 h-4 stroke-[1.5]" />
              <span className="font-medium">N° Immatriculation :</span>
              <span className="font-mono font-bold tracking-wider">{patient.cnssNumber || cnssInput}</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Modifier N°..."
                value={cnssInput}
                onChange={(e) => setCnssInput(e.target.value)}
                className="h-7 w-32 text-xs font-mono"
              />
              {cnssInput !== patient.cnssNumber && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-emerald-500 text-emerald-700 dark:text-emerald-400"
                  onClick={handleSaveCnss}
                  disabled={updatePatientMutation.isPending}
                >
                  Mettre à jour
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 1-Click Generation Action Bar */}
        <div className="p-3.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Générer une nouvelle Feuille de Soins
            </span>
            <div className="flex items-center gap-1.5">
              {(['CNSS', 'CNOPS', 'FAR'] as FormType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedFormType(type)}
                  className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                    selectedFormType === type
                      ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full h-9 text-xs bg-teal-600 hover:bg-teal-500 text-white font-medium cursor-pointer shadow-xs disabled:opacity-50"
            onClick={handleGenerate}
            disabled={generateMutation.isPending || (!patient.cnssNumber && !cnssInput.trim())}
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Printer className="w-4 h-4 mr-2 stroke-[1.5]" />
            )}
            <span>
              1-Clic : Générer &amp; Imprimer Feuille de Soins ({selectedFormType})
            </span>
          </Button>
        </div>

        {/* Existing Feuilles de Soins History */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Historique des Formulaires ({feuilles.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="h-6 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Actualiser
            </Button>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden max-h-52 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-zinc-400" />
                Chargement des feuilles de soins...
              </div>
            ) : feuilles.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                <FileText className="w-6 h-6 mx-auto mb-1 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                Aucune feuille de soins générée pour ce dossier.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 uppercase">
                    <th className="py-2 px-3">Organisme</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Montant</th>
                    <th className="py-2 px-3">Statut</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
                  {feuilles.map((f) => (
                    <tr key={f.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                      <td className="py-2 px-3 font-mono font-medium">
                        <span className="px-1.5 py-0.5 rounded text-[11px] bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                          {f.formType}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-zinc-600 dark:text-zinc-400">
                        {new Date(f.generatedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2 px-3 font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                        {f.totalAmountPaid ? `${f.totalAmountPaid.toFixed(2)} MAD` : '—'}
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {f.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-[11px] gap-1 cursor-pointer"
                          onClick={() => handlePrint(f)}
                          disabled={isPrintingId === f.id}
                        >
                          {isPrintingId === f.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Printer className="w-3 h-3" />
                          )}
                          <span>Réimprimer (PDF)</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
