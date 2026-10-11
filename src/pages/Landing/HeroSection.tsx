/**
 * HeroSection — Premium marketing overlay for the Landing page
 * Agent A scope: src/pages/Landing/
 *
 * Design: deep dark bg, emerald gradient accents, Framer Motion stagger
 * Language: Professional French (AGENTS.md)
 */
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

// ─────────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
}

// ─────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────
function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between glass"
    >
      {/* Wordmark */}
      <span
        className="gradient-text text-2xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Dossia
      </span>

      {/* Nav actions */}
      <div className="flex items-center gap-3">
        <Link
          to="/app"
          className="
            px-4 py-2 rounded-lg text-sm font-medium
            border border-[var(--color-dossia-border)]
            text-[var(--color-dossia-muted)]
            hover:border-[var(--color-dossia-accent)]
            hover:text-[var(--color-dossia-accent)]
            transition-all duration-200
          "
        >
          Se Connecter
        </Link>
        <Link
          to="/app"
          className="
            px-4 py-2 rounded-lg text-sm font-semibold
            bg-[var(--color-dossia-accent)] text-[var(--color-dossia-bg)]
            hover:opacity-90 transition-opacity duration-200
          "
        >
          Essai gratuit
        </Link>
      </div>
    </motion.nav>
  )
}

function TrustBadge({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-[var(--color-dossia-muted)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dossia-accent)]" />
      {label}
    </span>
  )
}

// ─────────────────────────────────────────────────
// Main HeroSection
// ─────────────────────────────────────────────────
export function HeroSection() {
  return (
    <>
      <Navbar />

      {/* Hero content — centered over the canvas */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-4xl mx-auto gap-6"
        >
          {/* Pill badge */}
          <motion.div variants={itemVariants}>
            <span
              className="
                glass px-4 py-1.5 rounded-full text-xs font-medium
                text-[var(--color-dossia-accent)]
                border border-[var(--color-dossia-accent)]/20
                inline-flex items-center gap-2
              "
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dossia-accent)] animate-pulse" />
              Conforme CNSS &amp; AMO · Paiements en MAD
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={itemVariants}
            className="text-7xl md:text-8xl lg:text-9xl font-bold gradient-text tracking-tight leading-none"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Dossia
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-2xl md:text-3xl font-medium text-[var(--color-dossia-text)] max-w-2xl leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Le cœur digital de votre cabinet médical.
          </motion.p>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-[var(--color-dossia-muted)] max-w-xl leading-relaxed"
          >
            Gérez vos patients, rendez-vous et feuilles de soins CNSS/AMO
            en quelques secondes. Conçu pour l&apos;assistante médicale marocaine.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mt-2"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/app"
                id="cta-primary"
                className="
                  flex items-center gap-2 px-7 py-3.5 rounded-xl
                  bg-[var(--color-dossia-accent)] text-[var(--color-dossia-bg)]
                  font-semibold text-sm tracking-wide
                  glow-accent-sm hover:opacity-90
                  transition-all duration-200
                "
              >
                <span>→</span>
                Démarrer Gratuitement
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/app"
                id="cta-demo"
                className="
                  flex items-center gap-2 px-7 py-3.5 rounded-xl
                  glass border border-[var(--color-dossia-border)]
                  text-[var(--color-dossia-text)] font-medium text-sm
                  hover:border-[var(--color-dossia-accent)]
                  hover:text-[var(--color-dossia-accent)]
                  transition-all duration-200
                "
              >
                ▷ Voir la démo
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust badges row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-4 border-t border-[var(--color-dossia-border)]/40 w-full"
          >
            <TrustBadge label="Conforme CNSS" />
            <TrustBadge label="Paiements MAD" />
            <TrustBadge label="Interface 100% Française" />
            <TrustBadge label="Noms arabes supportés" />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <span className="text-[var(--color-dossia-muted)] text-xs tracking-widest uppercase">
            Découvrir
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-[var(--color-dossia-accent)] to-transparent"
          />
        </motion.div>
      </section>
    </>
  )
}
