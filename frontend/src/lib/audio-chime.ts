/**
 * Native Browser Web Audio API Synthesizer for Clinic Notifications.
 * Zero external MP3/WAV assets required.
 * Generates an executive, non-intrusive two-tone clinical chime (D5 -> A5).
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // Audio context will resume upon the next user interaction
    })
  }
  return audioCtx
}

/**
 * Plays a discrete, pleasant two-tone notification chime for the secretary desk.
 * Tone 1: 587.33 Hz (D5) for 150ms
 * Tone 2: 880.00 Hz (A5) for 350ms
 */
export function playPatientCalledChime(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // ── First Note: D5 (587.33 Hz) ──
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now)

    gain1.gain.setValueAtTime(0.001, now)
    gain1.gain.exponentialRampToValueAtTime(0.15, now + 0.03)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)

    osc1.start(now)
    osc1.stop(now + 0.18)

    // ── Second Note: A5 (880.00 Hz) ──
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880.0, now + 0.12)

    gain2.gain.setValueAtTime(0.001, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.2, now + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55)

    osc2.connect(gain2)
    gain2.connect(ctx.destination)

    osc2.start(now + 0.12)
    osc2.stop(now + 0.55)
  } catch (err) {
    console.debug('Web Audio chime not playable yet (awaiting user gesture):', err)
  }
}
