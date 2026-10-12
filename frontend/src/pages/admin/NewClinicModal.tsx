import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Stethoscope, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateClinic } from '@/hooks/use-admin'

export interface ClinicRecord {
  id: string
  name: string
  ice: string
  city: string
  leadDoctor: string
  doctorEmail: string
  userCount: { doctors: number; secretaries: number }
  subscriptionPlan: 'STARTER' | 'PRO' | 'ENTERPRISE'
  status: 'ACTIVE' | 'SUSPENDED'
  monthlyFeeMAD: number
  createdAt: string
}

interface NewClinicModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClinicCreated: (clinic: ClinicRecord) => void
}

const MOROCCAN_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Tanger',
  'Fès',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
]

export function NewClinicModal({ open, onOpenChange, onClinicCreated }: NewClinicModalProps) {
  const [name, setName] = useState('')
  const [ice, setIce] = useState('')
  const [city, setCity] = useState('Casablanca')
  const [doctorFirstName, setDoctorFirstName] = useState('')
  const [doctorLastName, setDoctorLastName] = useState('')
  const [doctorEmail, setDoctorEmail] = useState('')
  const [plan, setPlan] = useState<'STARTER' | 'PRO' | 'ENTERPRISE'>('PRO')
  const createClinicMutation = useCreateClinic()
  const isSubmitting = createClinicMutation.isPending

  const getPlanPrice = (selectedPlan: 'STARTER' | 'PRO' | 'ENTERPRISE') => {
    switch (selectedPlan) {
      case 'STARTER':
        return 790
      case 'PRO':
        return 1490
      case 'ENTERPRISE':
        return 2990
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // ICE Validation: exactly 15 digits
    const cleanIce = ice.trim()
    if (!/^\d{15}$/.test(cleanIce)) {
      toast.error('ICE Invalide', {
        description: "L'Identifiant Commun de l'Entreprise (ICE) doit comporter exactement 15 chiffres.",
      })
      return
    }

    if (!name.trim()) {
      toast.error('Nom requis', {
        description: 'Veuillez renseigner le nom de la clinique ou du cabinet.',
      })
      return
    }

    if (!doctorEmail.trim() || !doctorEmail.includes('@')) {
      toast.error('Email invalide', {
        description: "Veuillez renseigner un email professionnel valide pour l'administrateur du cabinet.",
      })
      return
    }

    createClinicMutation.mutate(
      {
        name: name.trim(),
        ice: cleanIce,
        city,
        doctorFirstName: doctorFirstName.trim() || 'Amine',
        doctorLastName: doctorLastName.trim() || 'Tazi',
        doctorEmail: doctorEmail.trim(),
        plan,
      },
      {
        onSuccess: (data) => {
          onClinicCreated({
            id: data.id,
            name: data.name,
            ice: data.ice,
            city: data.city || city,
            leadDoctor: data.leadDoctorName,
            doctorEmail: data.leadDoctorEmail,
            userCount: { doctors: data.doctorCount || 1, secretaries: data.secretaryCount || 0 },
            subscriptionPlan: plan,
            status: data.subscriptionStatus,
            monthlyFeeMAD: getPlanPrice(plan),
            createdAt: new Date().toLocaleDateString('fr-MA', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
          })
          onOpenChange(false)
          setName('')
          setIce('')
          setCity('Casablanca')
          setDoctorFirstName('')
          setDoctorLastName('')
          setDoctorEmail('')
          setPlan('PRO')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <Building2 className="w-5 h-5 stroke-[1.5]" />
            <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Provisionner un Nouveau Cabinet
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Création d&apos;un tenant SaaS isolé avec compte administrateur médical et schéma CNDP conforme.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-2">
          {/* Section: Identité de la structure */}
          <div className="space-y-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Structure Médicale
            </h4>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                Raison Sociale / Nom du Cabinet <span className="text-red-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Centre Médical Ibn Rochd"
                className="h-8 text-xs font-sans"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  ICE (15 chiffres) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={ice}
                  onChange={(e) => setIce(e.target.value.replace(/\D/g, '').slice(0, 15))}
                  placeholder="001234567000089"
                  maxLength={15}
                  className="h-8 text-xs font-mono tabular-nums"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  Ville d&apos;implantation
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {MOROCCAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Praticien Référent */}
          <div className="space-y-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-zinc-400" />
              Praticien Référent (Administrateur du Cabinet)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  Prénom
                </label>
                <Input
                  value={doctorFirstName}
                  onChange={(e) => setDoctorFirstName(e.target.value)}
                  placeholder="Karim"
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  Nom
                </label>
                <Input
                  value={doctorLastName}
                  onChange={(e) => setDoctorLastName(e.target.value)}
                  placeholder="Bennani"
                  className="h-8 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Mail className="w-3 h-3 text-zinc-400" />
                Email professionnel (Login Dossia) <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                placeholder="dr.bennani@dossia.ma"
                className="h-8 text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* Section: Abonnement SaaS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Formule d&apos;Abonnement
              </h4>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                {getPlanPrice(plan)} MAD / mois
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['STARTER', 'PRO', 'ENTERPRISE'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`
                    p-2.5 rounded-md border text-left transition-colors cursor-pointer
                    ${
                      plan === p
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 text-zinc-900 dark:text-zinc-100 font-medium'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                    }
                  `}
                >
                  <div className="text-[11px] font-semibold flex items-center justify-between">
                    <span>{p}</span>
                    {plan === p && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-1 tabular-nums">
                    {getPlanPrice(p)} MAD
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CNDP notice */}
          <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              Conformité CNDP Loi 09-08 : Un schéma relationnel dédié et isolé par <code className="font-mono text-zinc-700 dark:text-zinc-300">clinic_id</code> sera alloué sans croisement de données de santé.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
            >
              {isSubmitting ? 'Création en cours…' : 'Créer et activer le cabinet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
