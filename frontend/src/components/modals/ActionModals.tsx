import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'
import { useAgendaStore } from '@/store/useAgendaStore'
import { MOCK_PATIENTS, MOCK_DOCTOR, type Appointment, type PaymentMethod, type InsuranceType } from '@/types/moroccan'
import { FileText, Printer, CheckCircle2 } from 'lucide-react'

export function ActionModals() {
  const { activeModal, closeModal } = useAppStore()
  const { addAppointment } = useAgendaStore()

  // New Consultation form state
  const [selectedPatientId, setSelectedPatientId] = useState(MOCK_PATIENTS[0]?.id || '')
  const [timeSlot, setTimeSlot] = useState('11:30')
  const [motif, setMotif] = useState('Consultation de suivi')

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('300')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Espèces')
  const [paymentRef, setPaymentRef] = useState('')

  // New patient state
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('+212 6 ')
  const [patientInsurance, setPatientInsurance] = useState<InsuranceType>('CNSS')

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    const today = new Date().toISOString().split('T')[0]
    const newAppt: Appointment = {
      id: `appt-${Date.now()}`,
      patientId: selectedPatientId,
      doctorId: MOCK_DOCTOR.id,
      date: today,
      heureDebut: timeSlot,
      heureFin: `${parseInt(timeSlot.split(':')[0])}:${parseInt(timeSlot.split(':')[1]) + 30}`,
      motif: motif,
      status: 'En attente',
    }
    addAppointment(newAppt)
    showToast('Rendez-vous programmé avec succès')
    closeModal()
  }

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault()
    showToast(`Paiement de ${paymentAmount} MAD enregistré (${paymentMethod})`)
    closeModal()
  }

  return (
    <>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Modal: Nouvelle Consultation ── */}
      <Dialog open={activeModal === 'new-consultation'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Nouvelle Consultation</DialogTitle>
            <DialogDescription>
              Planifier un nouveau rendez-vous pour aujourd&apos;hui.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAppointment} className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Patient
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-700"
              >
                {MOCK_PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nomComplet} ({p.telephone}) — {p.assurance}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Heure de début
                </label>
                <Input
                  type="time"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="font-mono tabular-nums"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Praticien
                </label>
                <div className="h-8 flex items-center px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs text-zinc-700 dark:text-zinc-300 truncate">
                  {MOCK_DOCTOR.nomComplet}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Motif de consultation
              </label>
              <Input
                type="text"
                placeholder="Ex. Contrôle tension, consultation générale"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <Button type="button" variant="ghost" size="sm" onClick={closeModal}>
                Annuler
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white border-0">
                Enregistrer RDV
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Ajouter un Paiement ── */}
      <Dialog open={activeModal === 'add-payment'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Encaisser un Paiement (MAD)</DialogTitle>
            <DialogDescription>
              Comptabilité du cabinet médical · Enregistrement immédiat.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordPayment} className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Patient concerné
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-700"
              >
                {MOCK_PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nomComplet} — {p.assurance}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Montant (MAD)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="font-mono tabular-nums pr-12 text-sm"
                    required
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 pointer-events-none">
                    MAD
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Mode de règlement
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-700"
                >
                  <option value="Espèces">Espèces</option>
                  <option value="Chèque">Chèque</option>
                  <option value="TPE">TPE / Carte bancaire</option>
                </select>
              </div>
            </div>

            {paymentMethod !== 'Espèces' && (
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Numéro de référence / Chèque
                </label>
                <Input
                  type="text"
                  placeholder="Ex: CHQ-8829104"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="font-mono tabular-nums"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <Button type="button" variant="ghost" size="sm" onClick={closeModal}>
                Annuler
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white border-0">
                Valider l&apos;encaissement
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Feuille de Soins (CNSS / AMO) ── */}
      <Dialog
        open={activeModal === 'generate-cnss' || activeModal === 'generate-amo'}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />
              <DialogTitle>
                Feuille de Soins — {activeModal === 'generate-cnss' ? 'CNSS' : 'AMO'}
              </DialogTitle>
            </div>
            <DialogDescription>
              Bordereau officiel pré-rempli pour remboursement maladie.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 space-y-2 text-xs">
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400">Praticien Déclarant</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-200">{MOCK_DOCTOR.nomComplet}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400">Code INPE</span>
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-200">{MOCK_DOCTOR.inpe}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400">Bénéficiaire</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-200">{MOCK_PATIENTS[0].nomComplet}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400">Immatriculation {activeModal === 'generate-cnss' ? 'CNSS' : 'AMO'}</span>
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-200">
                {MOCK_PATIENTS[0].cnss ?? '23456789'}
              </span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400">Honoraires Consultation</span>
              <span className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">300.00 MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Date de dispensation</span>
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-200">
                {new Date().toLocaleDateString('fr-MA')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-500">Document normalisé conforme ANAM</span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={closeModal}>
                Fermer
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  window.print()
                }}
              >
                <Printer className="w-3.5 h-3.5 stroke-[1.5]" />
                Imprimer le Volet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Nouveau Patient ── */}
      <Dialog open={activeModal === 'new-patient'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Nouveau Dossier Patient</DialogTitle>
            <DialogDescription>
              Création rapide d&apos;une fiche médicale patient.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              showToast(`Patient ${patientName || 'ajouté'} créé avec succès`)
              closeModal()
            }}
            className="space-y-3 pt-2"
          >
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Nom complet (Français ou Arabe)
              </label>
              <Input
                placeholder="Ex. Laila Chraibi / ليلى الشرايبي"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Téléphone (+212)
                </label>
                <Input
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="font-mono tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Assurance
                </label>
                <select
                  value={patientInsurance}
                  onChange={(e) => setPatientInsurance(e.target.value as InsuranceType)}
                  className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-700"
                >
                  <option value="CNSS">CNSS</option>
                  <option value="AMO">AMO</option>
                  <option value="RAMED">RAMED</option>
                  <option value="Privé">Privé</option>
                  <option value="Aucun">Sans couverture</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <Button type="button" variant="ghost" size="sm" onClick={closeModal}>
                Annuler
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white border-0">
                Créer le dossier
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
