/**
 * RoiCalculator — Interactive Moroccan Medical Clinic Financial ROI Engine
 * Adheres strictly to skills/01-premium-ui-craft.md
 * 
 * - Sliders: Patients/Jour (10-60), Tarif Consultation (150-500 MAD), Taux No-Show (5-20%)
 * - Dynamic formula:
 *     hoursSaved = ((patients * 4min) / 60) * 22 days
 *     revenueRecovered = (patients * noShowRate * fee * 0.40) * 22 days
 * - Tabular-nums font-mono display with instant recalculation
 */
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  Coins,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

export function RoiCalculator() {
  const { isAuthenticated, role } = useAuthStore()
  const appDestination = !isAuthenticated
    ? '/login'
    : role === 'SUPER_ADMIN'
      ? '/admin'
      : '/app'
  const [patientsPerDay, setPatientsPerDay] = useState(30)
  const [consultationFee, setConsultationFee] = useState(250)
  const [noShowRate, setNoShowRate] = useState(10)

  // Calculations based on 22 working days per month
  const { hoursSaved, revenueRecoveredMonthly, revenueRecoveredYearly, noShowsPrevented } = useMemo(() => {
    const workingDays = 22
    // 4 minutes saved per patient on administrative paperwork & FIP-1 filling
    const hours = Math.round(((patientsPerDay * 4) / 60) * workingDays)

    // WhatsApp automated reminder recovers 40% of missed appointments
    const monthlyTotalPatients = patientsPerDay * workingDays
    const monthlyNoShows = monthlyTotalPatients * (noShowRate / 100)
    const prevented = Math.round(monthlyNoShows * 0.4)
    const recoveredMonthly = Math.round(prevented * consultationFee)
    const recoveredYearly = recoveredMonthly * 12

    return {
      hoursSaved: hours,
      revenueRecoveredMonthly: recoveredMonthly,
      revenueRecoveredYearly: recoveredYearly,
      noShowsPrevented: prevented,
    }
  }, [patientsPerDay, consultationFee, noShowRate])

  return (
    <div className="w-full max-w-5xl mx-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden transition-colors">
      {/* Top Banner */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Simulateur de Rentabilité &amp; Gain de Temps
            </h3>
            <p className="text-[11px] text-zinc-500">
              Modèle financier adapté aux cabinets médicaux libéraux au Maroc.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
            Base : 22 jours ouvrés / mois
          </span>
        </div>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slider 1: Patients par jour */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="slider-patients" className="font-medium text-zinc-700 dark:text-zinc-300">
                Volume de patients par jour
              </label>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                {patientsPerDay} patients/j
              </span>
            </div>
            <input
              id="slider-patients"
              type="range"
              min="10"
              max="60"
              step="1"
              value={patientsPerDay}
              onChange={(e) => setPatientsPerDay(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>10 patients</span>
              <span>30 (Moyenne)</span>
              <span>60 patients</span>
            </div>
          </div>

          {/* Slider 2: Tarif Consultation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="slider-fee" className="font-medium text-zinc-700 dark:text-zinc-300">
                Tarif moyen de consultation (MAD)
              </label>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/80">
                {consultationFee} MAD
              </span>
            </div>
            <input
              id="slider-fee"
              type="range"
              min="150"
              max="500"
              step="10"
              value={consultationFee}
              onChange={(e) => setConsultationFee(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>150 MAD (Généraliste)</span>
              <span>300 MAD (Spécialiste)</span>
              <span>500 MAD</span>
            </div>
          </div>

          {/* Slider 3: Taux de No-Show */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="slider-noshow" className="font-medium text-zinc-700 dark:text-zinc-300">
                Taux moyen de rendez-vous non honorés (No-Show)
              </label>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/80">
                {noShowRate} %
              </span>
            </div>
            <input
              id="slider-noshow"
              type="range"
              min="5"
              max="20"
              step="1"
              value={noShowRate}
              onChange={(e) => setNoShowRate(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>5 %</span>
              <span>10 % (Standard)</span>
              <span>20 % (Critique)</span>
            </div>
          </div>

          {/* Methodological reassurance note */}
          <div className="pt-2 flex items-start gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0 stroke-[1.5]" />
            <span>
              Calcul basé sur 4 min gagnées par patient grâce au pré-remplissage CNSS/AMO et une réduction de 40% des absences par rappels WhatsApp programmés.
            </span>
          </div>
        </div>

        {/* Right Column: KPI Result Cards (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* KPI Card 1: Revenue Recovered */}
          <motion.div
            layout
            className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                Revenu Mensuel Récupéré
              </span>
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5 stroke-[1.5]" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
                +{revenueRecoveredMonthly.toLocaleString('fr-FR')}
              </span>
              <span className="text-sm font-mono text-zinc-500">MAD / mois</span>
            </div>

            <p className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
              Soit environ <strong className="font-mono text-zinc-800 dark:text-zinc-200">{revenueRecoveredYearly.toLocaleString('fr-FR')} MAD</strong> de chiffre d’affaires préservé par an ({noShowsPrevented} consultations sauvées/mois).
            </p>
          </motion.div>

          {/* KPI Card 2: Hours Saved */}
          <motion.div
            layout
            className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                Temps Secrétaire Économisé
              </span>
              <div className="w-6 h-6 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">
                {hoursSaved}
              </span>
              <span className="text-sm font-mono text-zinc-500">heures / mois</span>
            </div>

            <p className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
              Équivalent à <strong className="font-mono text-zinc-800 dark:text-zinc-200">{Math.round(hoursSaved / 8)} journées de travail</strong> réinvesties dans l’accueil des patients et le téléphone.
            </p>
          </motion.div>

          {/* Action CTA */}
          <Link
            to={appDestination}
            className="
              w-full py-2.5 px-4 rounded-md text-xs font-medium
              bg-emerald-600 hover:bg-emerald-500 text-white
              flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors
            "
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Tester Dossia gratuitement sur votre cabinet</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </Link>
        </div>
      </div>
    </div>
  )
}
