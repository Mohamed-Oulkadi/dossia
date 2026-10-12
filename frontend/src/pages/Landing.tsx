/**
 * Landing.tsx — Master Public-Facing SaaS Landing Page for Dossia
 * Adheres strictly to skills/01-premium-ui-craft.md
 * 
 * - Three.js 'Digital Pulse' HeroCanvas texture with React.lazy and Suspense
 * - Executive typography: 'Le cœur digital de votre cabinet médical.'
 * - Primary CTA: 'Réserver une Démo' / Secondary CTA: 'Voir le Produit' (/app)
 * - 3-Column Narrative: Zéro Paperasse, Caisse Sécurisée, Conformité CNDP
 * - Interactive Moroccan Clinic ROI Financial Calculator (MAD)
 */
import { lazy, Suspense, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { DossiaLogo } from '@/components/ui/DossiaLogo'
import { RoiCalculator } from '@/components/landing/RoiCalculator'
import {
  FileText,
  ShieldCheck,
  Coins,
  CreditCard,
  Lock,
  ArrowRight,
  ChevronRight,
  Sun,
  Moon,
  Calendar,
  Stethoscope,
  Building2,
  PhoneCall,
  CheckCircle,
} from 'lucide-react'

// Lazy-load Three.js canvas to never block main thread
const HeroCanvas = lazy(() => import('@/components/landing/HeroCanvas'))

function CanvasFallback() {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(16,185,129,0.06) 0%, rgba(9,9,11,0) 70%)',
      }}
    />
  )
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function Landing() {
  const { theme, toggleTheme } = useAppStore()
  const { isAuthenticated, role } = useAuthStore()
  const [demoRequested, setDemoRequested] = useState(false)

  const appDestination = !isAuthenticated
    ? '/login'
    : role === 'SUPER_ADMIN'
      ? '/admin'
      : '/app'

  const handleDemoClick = () => {
    setDemoRequested(true)
    const el = document.getElementById('demo-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300">
      {/* ── Fixed Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors"
      >
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DossiaLogo className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Dossia
            </span>
            <span className="text-[10px] font-mono px-1 py-0.2 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded">
              SaaS Médical
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#why-dossia" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Avantages
            </a>
            <a href="#roi-calculator" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Calculateur ROI
            </a>
            <a href="#compliance" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Conformité CNDP
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
            className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer mr-1"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 stroke-[1.5]" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700 stroke-[1.5]" />
            )}
          </button>

          <Link
            to={isAuthenticated ? appDestination : '/login'}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {isAuthenticated ? 'Mon Espace' : 'Connexion'}
          </Link>

          <Link
            to={appDestination}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>{role === 'SUPER_ADMIN' ? 'Espace Super Admin' : 'Accéder au Cabinet'}</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero Section (with Three.js WebGL background) ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 pt-28 pb-16 overflow-hidden">
        <Suspense fallback={<CanvasFallback />}>
          <HeroCanvas />
        </Suspense>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto gap-6"
        >
          {/* Pill Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Conforme ANAM · Norme CNSS &amp; AMO (FIP-1)</span>
            </div>
          </motion.div>

          {/* Primary Pitch H1 */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.12]"
          >
            Le cœur digital de votre <br className="hidden sm:inline" />
            <span className="text-zinc-500 dark:text-zinc-400">cabinet médical.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed"
          >
            Dossia synchronise votre agenda, automatise vos feuilles de soins (CNSS/AMO) et sécurise votre caisse sur une plateforme unique et ultra-rapide.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-3 pt-2"
          >
            <button
              type="button"
              id="cta-demo"
              onClick={handleDemoClick}
              className="px-6 py-2.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <span>Réserver une Démo</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>

            <Link
              to={appDestination}
              id="cta-product"
              className="px-5 py-2.5 rounded-md text-xs font-medium border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors flex items-center gap-2"
            >
              <span>{role === 'SUPER_ADMIN' ? 'Espace Super Admin' : 'Voir le Produit'}</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </Link>
          </motion.div>

          {/* Moroccan Trust Row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 w-full"
          >
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />
              <span>Bordereaux CNSS / AMO (FIP-1)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />
              <span>Facturation &amp; Caisse en MAD</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />
              <span>Conformité CNDP Loi 09-08</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />
              <span>Données de santé chiffrées</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Section: Why Dossia Narrative (3-Column Grid) ── */}
      <section id="why-dossia" className="py-20 px-4 sm:px-8 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
              Performance Clinique &amp; Secrétariat
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Résolvez les frictions quotidiennes de votre cabinet.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Conçu pour le rythme soutenu des cabinets médicaux marocains accueillant entre 20 et 60 patients par jour.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Zéro Paperasse */}
            <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
                  <FileText className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Zéro Paperasse
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Générez les feuilles de soins AMO/CNSS pré-remplies en 1 clic. Fini les heures de saisie manuelle.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Norme FIP-1 ANAM</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">SLA &lt; 3s</span>
              </div>
            </div>

            {/* Card 2: Caisse Sécurisée */}
            <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <CreditCard className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Caisse Sécurisée
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Une vue claire sur vos encaissements (Espèces, TPE, Chèques) pour une clôture journalière sans erreur.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Multi-règlements MAD</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">0 écart</span>
              </div>
            </div>

            {/* Card 3: Conformité CNDP */}
            <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Conformité CNDP
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Hébergement local sécurisé et architecture conforme à la loi 09-08 relative à la protection des données à caractère personnel.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Loi marocaine 09-08</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Certifié</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Interactive ROI Calculator ── */}
      <section id="roi-calculator" className="py-20 px-4 sm:px-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
              Rentabilité Clinique
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Mesurez l'impact financier direct sur votre cabinet.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Ajustez les curseurs pour modéliser le temps gagné par votre secrétaire et le chiffre d'affaires récupéré.
            </p>
          </div>

          <RoiCalculator />
        </div>
      </section>

      {/* ── Section: Module Overview & Architecture ── */}
      <section id="compliance" className="py-20 px-4 sm:px-8 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
              Suite Complète Intégrée
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Du premier appel à la clôture de caisse.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2.5">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-sm">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Smart Agenda Médical</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Prise de rendez-vous en moins de 3 secondes avec navigation clavier intégrale et statuts de consultation en temps réel.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2.5">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-sm">
                <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Espace Praticien &amp; Ordonnance</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Suivi des constantes vitales, diagnostic et génération d'ordonnances médicamenteuses instantanées avec posologie.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2.5">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-sm">
                <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Caisse Journalière &amp; Bordereaux</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Journal de caisse par mode de paiement (Espèces, TPE, Chèque) et édition immédiate des reçus de consultation en MAD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Demo Booking Callout ── */}
      <section id="demo-section" className="py-16 px-4 sm:px-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-center space-y-5">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <PhoneCall className="w-5 h-5 stroke-[1.5]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Prêt à moderniser votre cabinet ?
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Bénéficiez d'une démonstration sur mesure de 15 minutes et d'un accompagnement personnalisé pour la formation de votre secrétaire.
            </p>
          </div>

          {demoRequested ? (
            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium max-w-sm mx-auto flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Demande transmise ! Un conseiller vous contactera sous 24h.</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDemoRequested(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer transition-colors"
              >
                Confirmer la demande de démo
              </button>
              <Link
                to={appDestination}
                className="w-full sm:w-auto px-5 py-2.5 rounded-md text-xs font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {role === 'SUPER_ADMIN' ? 'Accéder à l’administration SaaS' : 'Accéder immédiatement au logiciel'}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-4 sm:px-8 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <DossiaLogo className="w-3 h-3 text-emerald-600" />
            </div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Dossia Maroc</span>
            <span>— Le digital au service de l'art médical</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
            <span>CNDP n° D-W-982/2026</span>
            <span>·</span>
            <span>Norme ANAM INPE</span>
            <span>·</span>
            <Link to={appDestination} className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
              {role === 'SUPER_ADMIN' ? 'Portail Super Admin' : 'Portail Cabinet'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
