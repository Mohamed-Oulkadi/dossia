/**
 * HeroSection — Premium marketing overlay for the Landing page
 * Refactored for Clinical Craft & Executive SaaS Design System
 * 
 * - Purged AI tropes: no gradient text, no glow boxes, no neon colors
 * - Standardized Lucide icons: w-4 h-4 stroke-[1.5]
 * - 1px hairline border system (border-zinc-800)
 * - Surgical dark mode typography with pure zinc-100 headers
 */
import { motion, type Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Lock,
  FileCheck2,
  Coins,
  ChevronRight,
} from 'lucide-react'

// ─────────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

// ─────────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────────
function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-3 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md"
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-emerald-500 stroke-[1.5]" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-zinc-100">
          Dossia
        </span>
        <span className="text-[10px] font-mono px-1 py-0.2 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded">
          SaaS Médical
        </span>
      </div>

      {/* Nav actions */}
      <div className="flex items-center gap-2">
        <Link
          to="/app"
          className="
            px-3 py-1.5 rounded-md text-xs font-medium
            border border-zinc-800 text-zinc-300
            hover:border-zinc-700 hover:text-zinc-100
            transition-colors
          "
        >
          Connexion
        </Link>
        <Link
          to="/app"
          className="
            px-3 py-1.5 rounded-md text-xs font-medium
            bg-zinc-100 text-zinc-950 hover:bg-zinc-200
            transition-colors flex items-center gap-1.5
          "
        >
          <span>Accéder au cabinet</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
        </Link>
      </div>
    </motion.nav>
  )
}

function TrustBadge({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
      <Icon className="w-3.5 h-3.5 text-emerald-400 stroke-[1.5]" />
      <span>{label}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────
// Main HeroSection
// ─────────────────────────────────────────────────
export function HeroSection() {
  return (
    <>
      <Navbar />

      {/* Hero content — centered over the subtle canvas */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-3xl mx-auto gap-5"
        >
          {/* Pill badge */}
          <motion.div variants={itemVariants}>
            <div className="
              inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
              bg-zinc-900/80 border border-zinc-800 text-zinc-300
            ">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Conforme ANAM · Norme CNSS &amp; AMO</span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-semibold text-zinc-100 tracking-tight leading-tight"
          >
            Le cœur digital de votre <br />
            <span className="text-zinc-300">cabinet médical au Maroc.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-sm md:text-base text-zinc-400 max-w-xl leading-relaxed"
          >
            Gestion des consultations, télétransmission CNSS/AMO et encaissement en Dirhams (MAD).
            Conçu pour la cadence des secrétaires médicales et praticiens.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-3 pt-2"
          >
            <Link
              to="/app"
              id="cta-primary"
              className="
                flex items-center gap-2 px-5 py-2.5 rounded-md
                bg-zinc-100 text-zinc-950 font-medium text-xs
                hover:bg-zinc-200 transition-colors
              "
            >
              <span>Ouvrir l&apos;Agenda Cabinet</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </Link>

            <Link
              to="/app"
              id="cta-demo"
              className="
                flex items-center gap-2 px-5 py-2.5 rounded-md
                border border-zinc-800 bg-zinc-900/50
                text-zinc-300 font-medium text-xs
                hover:border-zinc-700 hover:text-zinc-100
                transition-colors
              "
            >
              <FileCheck2 className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5]" />
              <span>Consulter une Fiche CNSS</span>
            </Link>
          </motion.div>

          {/* Trust badges row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-5 mt-6 pt-6 border-t border-zinc-800/80 w-full"
          >
            <TrustBadge icon={FileCheck2} label="Bordereaux CNSS / AMO" />
            <TrustBadge icon={Coins} label="Facturation en MAD" />
            <TrustBadge icon={Lock} label="Données de santé chiffrées" />
            <TrustBadge icon={ShieldCheck} label="Support bilingue FR / AR" />
          </motion.div>
        </motion.div>
      </section>
    </>
  )
}
