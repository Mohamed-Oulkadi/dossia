/**
 * DoctorWorkspaceStageDemo — Stageshow Faux Product Hero Demo
 * 
 * Strict Stageshow Craft Governance (.agents/skills/stageshow/SKILL.md):
 * - One single signature action: Voice Scribe -> Instant Auto-Fill -> 1-Click Moroccan A4 Ordonnance PDF
 * - Tightly cropped ~760x410 viewport (zero dead margins or unused chrome)
 * - Authentic 4-Beat looping choreography (~6.5s) with realistic SVG cursor trajectory
 * - High-density Patient Context Ribbon (Youssef Benali • CNOPS • CIN BK612984)
 * - Moroccan medical domain tokens: DMP drug catalog, INPE 987654321, Cachet stamp, strict MAD alignment
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  Sparkles,
  Printer,
  CheckCircle2,
  Activity,
  Scale,
  Heart,
  Pill,
  FileText,
  Zap,
} from 'lucide-react'

export function DoctorWorkspaceStageDemo() {
  const [elapsed, setElapsed] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // 6.5-second master loop
  const LOOP_DURATION = 6500

  useEffect(() => {
    if (prefersReducedMotion.current) {
      setElapsed(4500) // Hold on finished poster state
      return
    }

    let start = performance.now()
    let frameId: number

    const tick = (now: number) => {
      if (!isPaused) {
        const diff = (now - start) % LOOP_DURATION
        setElapsed(diff)
      }
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [isPaused])

  // Beat milestones
  // Beat 1: 0.0s – 1.8s (Mic click & dictation waveform)
  // Beat 2: 1.8s – 3.4s (Vitals & Rx staggered arrival)
  // Beat 3: 3.4s – 5.2s (Cursor clicks Print Ordonnance -> Satellite card rises)
  // Beat 4: 5.2s – 6.5s (Payoff hold, then soft reset)

  const isMicHover = elapsed >= 500 && elapsed < 1800
  const isMicClick = elapsed >= 650 && elapsed < 950
  const isDictating = elapsed >= 800 && elapsed < 1800

  const isAutofilled = elapsed >= 1800 && elapsed < 6200
  const showRow1 = elapsed >= 2100 && elapsed < 6200
  const showRow2 = elapsed >= 2500 && elapsed < 6200

  const isPrintHover = elapsed >= 3800 && elapsed < 5200
  const isPrintClick = elapsed >= 4200 && elapsed < 4500
  const showSatellite = elapsed >= 4400 && elapsed < 6100

  // Cursor position trajectory (relative to 760x410 frame)
  let cursor = { x: 380, y: 320, clicking: false, opacity: 1 }

  if (elapsed < 600) {
    // Travel to Mic button
    const t = Math.min(1, elapsed / 600)
    cursor.x = 380 + (135 - 380) * easeOutCubic(t)
    cursor.y = 320 + (84 - 320) * easeOutCubic(t)
  } else if (elapsed < 950) {
    // Click on Mic
    cursor.x = 135
    cursor.y = 84
    cursor.clicking = isMicClick
  } else if (elapsed < 1800) {
    // Rest gently near waveform
    cursor.x = 160
    cursor.y = 100
  } else if (elapsed < 3400) {
    // Hover over vitals / prescription rows
    const t = Math.min(1, (elapsed - 1800) / 1000)
    cursor.x = 160 + (280 - 160) * easeOutCubic(t)
    cursor.y = 100 + (210 - 100) * easeOutCubic(t)
  } else if (elapsed < 4200) {
    // Glide down to Floating Command Dock Print button
    const t = Math.min(1, (elapsed - 3400) / 800)
    cursor.x = 280 + (555 - 280) * easeOutCubic(t)
    cursor.y = 210 + (352 - 210) * easeOutCubic(t)
  } else if (elapsed < 4600) {
    // Click Print button
    cursor.x = 555
    cursor.y = 352
    cursor.clicking = isPrintClick
  } else if (elapsed < 6100) {
    // Drift to inspect the satellite ordonnance card
    const t = Math.min(1, (elapsed - 4600) / 800)
    cursor.x = 555 + (620 - 555) * easeOutCubic(t)
    cursor.y = 352 + (240 - 352) * easeOutCubic(t)
  } else {
    // Fade out cursor at loop seam
    cursor.x = 620
    cursor.y = 240
    cursor.opacity = Math.max(0, 1 - (elapsed - 6100) / 300)
  }

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full max-w-[760px] mx-auto select-none group/stage"
    >
      {/* Ambient Ground Glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-teal-500/15 blur-xl opacity-75 group-hover/stage:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Main 760x410 Inset Stage Frame */}
      <div className="relative h-[410px] w-full rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col font-sans">
        {/* ── 1. Top Window Chrome / Breadcrumb ── */}
        <div className="h-9 px-3.5 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800 ml-1" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Espace Consultation · Speed Engine
            </span>
            <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
              Dr. Amina Benjelloun
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500">
            <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
              CNDP 09-08
            </span>
            <span className="hidden sm:inline font-bold text-emerald-600 dark:text-emerald-400">
              STRICT MAD
            </span>
          </div>
        </div>

        {/* ── 2. Patient Context Ribbon ── */}
        <div className="h-10 px-4 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center font-bold text-[10px] font-mono">
              YB
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Youssef Benali
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                34 ans
              </span>
              <span className="font-mono text-[10px] text-zinc-500 hidden sm:inline">
                CIN: <strong className="text-zinc-700 dark:text-zinc-300">BK612984</strong>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                CNOPS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-zinc-400 hidden sm:inline">RDV:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">10:15</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
              URGENCE
            </span>
          </div>
        </div>

        {/* ── 3. Voice Scribe Bar (Beat 1 Target) ── */}
        <div className="px-4 py-2 bg-zinc-50/70 dark:bg-zinc-950/50 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-7 px-2.5 rounded-md border flex items-center gap-1.5 text-[11px] font-semibold transition-all duration-150 ${
                isMicHover
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
              } ${isMicClick ? 'scale-95 ring-2 ring-emerald-500/40' : ''}`}
            >
              <Mic
                className={`w-3.5 h-3.5 transition-colors ${
                  isDictating
                    ? 'text-rose-500 animate-pulse'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              />
              <span>{isDictating ? 'Dictée en cours…' : 'Dictée Vocale IA'}</span>
              <kbd className="hidden sm:inline font-mono text-[9px] px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                Alt+R
              </kbd>
            </div>

            {/* Pulsing Audio Equalizer (5 Bars) */}
            {isDictating && (
              <div className="flex items-center gap-0.5 h-4 px-1.5 bg-white dark:bg-zinc-900 rounded border border-emerald-300/80 dark:border-emerald-800/80 animate-in fade-in duration-150">
                <span className="w-1 bg-emerald-500 rounded-full animate-[bounce_0.6s_infinite_100ms] h-2.5" />
                <span className="w-1 bg-emerald-500 rounded-full animate-[bounce_0.6s_infinite_200ms] h-3.5" />
                <span className="w-1 bg-emerald-500 rounded-full animate-[bounce_0.6s_infinite_150ms] h-2" />
                <span className="w-1 bg-emerald-500 rounded-full animate-[bounce_0.6s_infinite_300ms] h-3" />
                <span className="w-1 bg-emerald-500 rounded-full animate-[bounce_0.6s_infinite_180ms] h-1.5" />
              </div>
            )}

            {/* Live Dictated Transcript Bubble */}
            {isDictating && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex items-center gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-300 italic bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-2xs max-w-[340px] truncate"
              >
                <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
                <span className="truncate">
                  « Angine aiguë • TA 12/8, 74 kg • Augmentin 1g + Doliprane 1000 »
                </span>
              </motion.div>
            )}
          </div>

          <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
            Extraction JSON Structurée
          </span>
        </div>

        {/* ── 4. Main Two-Column Clinical Stage Content ── */}
        <div className="flex-1 p-3.5 grid grid-cols-12 gap-3 overflow-hidden bg-slate-50/40 dark:bg-zinc-950/20">
          {/* Left Column: Vitals & Diagnostic (5 cols) */}
          <div className="col-span-5 space-y-2.5">
            {/* Vitals Instrument Cluster */}
            <div className="p-2 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-600" />
                  Constantes
                </span>
                {isAutofilled && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 animate-in fade-in">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Auto-rempli
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {/* TA */}
                <div
                  className={`p-1.5 rounded-md border text-center transition-all duration-300 ${
                    isAutofilled
                      ? 'border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/30'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40'
                  }`}
                >
                  <span className="block text-[9px] font-mono text-zinc-400">TA</span>
                  <span className="text-xs font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {isAutofilled ? '12/8' : '—'}
                  </span>
                  <span className="block text-[8px] font-mono text-zinc-400">mmHg</span>
                </div>

                {/* Poids */}
                <div
                  className={`p-1.5 rounded-md border text-center transition-all duration-300 ${
                    isAutofilled
                      ? 'border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/30'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40'
                  }`}
                >
                  <span className="block text-[9px] font-mono text-zinc-400 flex items-center justify-center gap-0.5">
                    <Scale className="w-2.5 h-2.5" /> Poids
                  </span>
                  <span className="text-xs font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {isAutofilled ? '74.0' : '—'}
                  </span>
                  <span className="block text-[8px] font-mono text-zinc-400">kg</span>
                </div>

                {/* FC */}
                <div
                  className={`p-1.5 rounded-md border text-center transition-all duration-300 ${
                    isAutofilled
                      ? 'border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/30'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40'
                  }`}
                >
                  <span className="block text-[9px] font-mono text-zinc-400 flex items-center justify-center gap-0.5">
                    <Heart className="w-2.5 h-2.5 text-rose-500" /> FC
                  </span>
                  <span className="text-xs font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {isAutofilled ? '78' : '—'}
                  </span>
                  <span className="block text-[8px] font-mono text-zinc-400">bpm</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Card */}
            <div className="p-2 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                Diagnostic Médical
              </span>
              <div className="h-6 flex items-center px-2 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                {isAutofilled ? 'Angine aiguë fébrile (odynophagie)' : 'En attente d’examen…'}
              </div>
            </div>
          </div>

          {/* Right Column: Prescription Speed Engine (7 cols) */}
          <div className="col-span-7 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80 dark:border-zinc-800 text-[11px]">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                <Pill className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ordonnance Médicale</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {showRow2 ? '2 Rx' : showRow1 ? '1 Rx' : '0'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> Protocole Actif
              </span>
            </div>

            {/* Dynamic Medication Rows (Staggered Spring Motion) */}
            <div className="space-y-1.5">
              {/* Row 1: Augmentin */}
              <AnimatePresence>
                {showRow1 ? (
                  <motion.div
                    key="row-augmentin"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="p-2 rounded-lg border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Augmentin 1g/125mg sachet
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        DMP Maroc
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>1 sachet 2 fois par jour</span>
                      <span className="text-zinc-400">Pendant 7 jours</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-11 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                    Ligne #1 vide (En attente de dictée)
                  </div>
                )}
              </AnimatePresence>

              {/* Row 2: Doliprane */}
              <AnimatePresence>
                {showRow2 ? (
                  <motion.div
                    key="row-doliprane"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="p-2 rounded-lg border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Doliprane 1000mg comprimé
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        DMP Maroc
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>1 cp 3 fois par jour</span>
                      <span className="text-zinc-400">Pendant 5 jours (espacer de 6h)</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-11 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                    Ligne #2 vide
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── 5. Floating High-Contrast Command Dock ── */}
        <div className="absolute bottom-3 left-4 right-4 z-20 h-10 px-3.5 bg-zinc-950/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl border border-zinc-800 shadow-xl flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-zinc-200">
              Youssef Benali
            </span>
            <span className="font-mono text-zinc-500">·</span>
            <span className="font-mono text-[11px] text-zinc-400">
              {showRow2 ? '2 médicaments' : '0 médicament'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* The Print PDF Button Target (Beat 3) */}
            <div
              className={`h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                isPrintHover
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-emerald-600 text-white'
              } ${isPrintClick ? 'scale-90 ring-2 ring-emerald-400' : ''}`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer l&apos;Ordonnance (PDF)</span>
            </div>
          </div>
        </div>

        {/* ── 6. Satellite A4 Moroccan Ordonnance Preview Card (Beat 3 Payoff) ── */}
        <AnimatePresence>
          {showSatellite && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              className="absolute right-3.5 bottom-12 z-30 w-72 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-300 dark:border-zinc-700 shadow-2xl p-3 space-y-2 text-zinc-900 dark:text-zinc-100"
            >
              {/* Ordonnance Header */}
              <div className="pb-1.5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between">
                <div>
                  <h4 className="text-[11px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Dr. Amina Benjelloun
                  </h4>
                  <p className="text-[9px] text-zinc-500">Médecine Générale &amp; Urgences</p>
                  <p className="font-mono text-[8px] text-emerald-600 dark:text-emerald-400 font-bold">
                    INPE: 987654321 · ICE: 002345678000045
                  </p>
                </div>
                <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Patient Badge */}
              <div className="flex items-center justify-between font-mono text-[9px] bg-zinc-50 dark:bg-zinc-900 p-1 rounded">
                <span>Patient: <strong>Youssef Benali (34 ans)</strong></span>
                <span className="text-zinc-400">Le 07/11/2026</span>
              </div>

              {/* Prescribed Items in Miniature */}
              <div className="space-y-1 text-[10px] font-sans">
                <div className="p-1 rounded bg-slate-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
                  <p className="font-bold text-zinc-800 dark:text-zinc-200">1. Augmentin 1g/125mg</p>
                  <p className="text-[9px] text-zinc-500">1 sachet 2x/jour pendant 7 jours</p>
                </div>
                <div className="p-1 rounded bg-slate-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
                  <p className="font-bold text-zinc-800 dark:text-zinc-200">2. Doliprane 1000mg</p>
                  <p className="text-[9px] text-zinc-500">1 cp 3x/jour si douleur/fièvre (5 jours)</p>
                </div>
              </div>

              {/* Moroccan Cachet & Signature Stamp in Blue Ink */}
              <div className="pt-1 flex items-center justify-between text-[9px]">
                <span className="text-zinc-400 font-mono text-[8px]">Généré via Dossia</span>
                <div className="border border-blue-600/70 dark:border-blue-500/70 rounded-full px-2 py-0.5 text-blue-700 dark:text-blue-400 font-mono text-[8px] font-bold rotate-[-3deg] shadow-2xs">
                  ✓ CACHET &amp; SIGNATURE VALIDES
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 7. Authentic Animated SVG Cursor ── */}
        <div
          style={{
            transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
            opacity: cursor.opacity,
          }}
          className="pointer-events-none absolute left-0 top-0 z-50 transition-transform duration-75 ease-out"
        >
          <div
            className={`transition-transform duration-100 ${
              cursor.clicking ? 'scale-75' : 'scale-100'
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)]"
            >
              <path
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.85a.5.5 0 0 0-.85.36z"
                fill="#09090B"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

