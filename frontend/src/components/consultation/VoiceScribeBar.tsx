/**
 * VoiceScribeBar — Medical Voice-to-Form Dictation Bar (`Dictée Vocale Clinique`)
 * High-density clinical control bar with Web Audio live waveform, elapsed timer,
 * Alt+R global keyboard shortcut, and raw transcript inspection drawer.
 * Strict CNDP Loi 09-08 compliance (Zero-PII audio streaming).
 */
import { useEffect, useState } from 'react'
import {
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  X,
  FileText,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { VoiceConsultationExtract, VoiceScribeState } from '@/hooks/use-voice-scribe'

interface VoiceScribeBarProps {
  state?: VoiceScribeState
  isRecording: boolean
  isProcessing: boolean
  recordingSeconds: number
  audioLevel: number
  extractedData: VoiceConsultationExtract | null
  liveTranscript?: string
  onStartRecording: () => void
  onStopAndTranscribe: () => void
  onCancelRecording: () => void
  onReset: () => void
}

export function VoiceScribeBar({
  state: _state,
  isRecording,
  isProcessing,
  recordingSeconds,
  audioLevel,
  extractedData,
  liveTranscript,
  onStartRecording,
  onStopAndTranscribe,
  onCancelRecording,
  onReset,
}: VoiceScribeBarProps) {
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false)
  const [hasCopiedTranscript, setHasCopiedTranscript] = useState(false)

  // Alt + R Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault()
        if (isRecording) {
          onStopAndTranscribe()
        } else if (!isProcessing) {
          onStartRecording()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRecording, isProcessing, onStartRecording, onStopAndTranscribe])

  // Format seconds to mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Copy transcript to clipboard
  const handleCopyTranscript = () => {
    if (extractedData?.rawTranscript) {
      navigator.clipboard.writeText(extractedData.rawTranscript)
      setHasCopiedTranscript(true)
      toast.success('Transcription copiée dans le presse-papier')
      setTimeout(() => setHasCopiedTranscript(false), 2000)
    }
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="px-4 py-2 flex items-center justify-between gap-4">
        {/* ── Left: Scribe Actions & Waveform ── */}
        <div className="flex items-center gap-3">
          {/* IDLE / COMPLETED State */}
          {!isRecording && !isProcessing && (
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onStartRecording}
                className="h-8 gap-1.5 text-xs font-semibold border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 shadow-2xs cursor-pointer group"
                title="Démarrer la dictée vocale (Alt + R)"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Dictée Vocale (FR)</span>
                <kbd className="hidden sm:inline-block ml-1 font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                  Alt + R
                </kbd>
              </Button>

              <span className="hidden md:inline-block text-[11px] text-zinc-500 dark:text-zinc-400">
                Dictez : <strong className="text-zinc-700 dark:text-zinc-300">Motif</strong>,{' '}
                <strong className="text-zinc-700 dark:text-zinc-300">Constantes (TA, Poids, FC)</strong>,{' '}
                <strong className="text-zinc-700 dark:text-zinc-300">Examen</strong>,{' '}
                <strong className="text-zinc-700 dark:text-zinc-300">Diagnostic</strong> et{' '}
                <strong className="text-zinc-700 dark:text-zinc-300">Ordonnance</strong>.
              </span>
            </div>
          )}

          {/* RECORDING State */}
          {isRecording && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                <span className="text-xs font-semibold">Enregistrement en cours</span>
                <span className="font-mono text-xs tabular-nums font-bold ml-1">
                  {formatTimer(recordingSeconds)}
                </span>
              </div>

              {/* 5-Bar Live Equalizer / Waveform */}
              <div className="flex items-center gap-1 h-5 px-2 bg-slate-100 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                {[0.4, 0.8, 1.0, 0.7, 0.5].map((multiplier, i) => {
                  const barHeight = Math.max(
                    4,
                    Math.min(20, Math.round(audioLevel * 20 * multiplier) + 4)
                  )
                  return (
                    <div
                      key={i}
                      style={{ height: `${barHeight}px` }}
                      className="w-1 bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-75"
                    />
                  )
                })}
              </div>

              {liveTranscript && (
                <span className="hidden lg:inline-block max-w-[260px] truncate text-[11px] text-zinc-600 dark:text-zinc-300 italic bg-white/80 dark:bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-200/80 dark:border-zinc-800">
                  « {liveTranscript} »
                </span>
              )}

              {/* Action: Terminer & Remplir */}
              <Button
                type="button"
                size="sm"
                onClick={() => onStopAndTranscribe()}
                className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Terminer &amp; Remplir</span>
                <kbd className="hidden sm:inline-block ml-1 font-mono text-[9px] uppercase px-1 py-0.2 rounded bg-emerald-700 text-emerald-100">
                  Alt + R
                </kbd>
              </Button>

              {/* Action: Annuler */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancelRecording}
                className="h-8 px-2 text-xs text-zinc-500 hover:text-rose-600 cursor-pointer"
                title="Annuler l'enregistrement"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                <span>Annuler</span>
              </Button>
            </div>
          )}

          {/* PROCESSING State */}
          {isProcessing && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
              <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <span className="text-xs font-medium animate-pulse">
                Structuration médicale française en cours (IA Clinique)…
              </span>
            </div>
          )}
        </div>

        {/* ── Right: Extracted Transcript & Scribe Badges ── */}
        <div className="flex items-center gap-2">
          {extractedData && (
            <>
              <Badge
                variant="outline"
                className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30"
              >
                Auto-rempli par IA ({extractedData.medications.length} Rx)
              </Badge>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsTranscriptOpen((prev) => !prev)}
                className="h-7 px-2 gap-1 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800"
              >
                <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Transcription brute</span>
                {isTranscriptOpen ? (
                  <ChevronUp className="w-3 h-3 ml-0.5" />
                ) : (
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-7 px-2 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                title="Réinitialiser l'état de la dictée"
              >
                <MicOff className="w-3 h-3" />
              </Button>
            </>
          )}

          <Badge variant="outline" className="font-mono text-[9px] text-zinc-400">
            CNDP 09-08 Zero-PII
          </Badge>
        </div>
      </div>

      {/* ── Collapsible Raw Transcript Drawer / Popover ── */}
      {isTranscriptOpen && extractedData?.rawTranscript && (
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Texte de la Dictée Vocale Reconnu :
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyTranscript}
              className="h-6 px-2 text-[10px] gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              {hasCopiedTranscript ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copier le texte</span>
                </>
              )}
            </Button>
          </div>
          <p className="p-2.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] leading-relaxed select-text whitespace-pre-wrap">
            {extractedData.rawTranscript}
          </p>
        </div>
      )}
    </div>
  )
}
