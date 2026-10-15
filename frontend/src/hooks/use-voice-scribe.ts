import { useState, useRef, useCallback, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export interface ExtractedMedication {
  matchedCatalogId?: string | null
  medicationName: string
  dosage: string
  duration: string
  instructions?: string
  matchedInMoroccanCatalog: boolean
}

export interface VoiceConsultationExtract {
  rawTranscript: string
  motif: string
  clinicalNotes: string
  diagnosis: string
  bloodPressure: string
  weightKg: number | null
  heartRateBpm: number | null
  medications: ExtractedMedication[]
  suggestedBilans: string[]
}

export type VoiceScribeState = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'

export interface UseVoiceScribeOptions {
  onSuccess?: (data: VoiceConsultationExtract) => void
  onError?: (error: Error) => void
}

export function useVoiceScribe(options?: UseVoiceScribeOptions) {
  const [state, setState] = useState<VoiceScribeState>('IDLE')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [extractedData, setExtractedData] = useState<VoiceConsultationExtract | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const timerIntervalRef = useRef<number | null>(null)
  const speechRecognitionRef = useRef<any>(null)
  const speechTranscriptRef = useRef<string>('')
  const [liveTranscript, setLiveTranscript] = useState<string>('')

  // API Mutation to send the audio blob and transcript to Dossia backend
  const scribeMutation = useMutation<
    VoiceConsultationExtract,
    Error,
    { audioBlob: Blob; transcript?: string; consultationId?: string }
  >({
    mutationFn: async ({ audioBlob, transcript, consultationId }) => {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'dictee_medicale.webm')
      if (transcript && transcript.trim() !== '') {
        formData.append('transcript', transcript.trim())
      }
      if (
        consultationId &&
        typeof consultationId === 'string' &&
        consultationId.trim() !== '' &&
        consultationId !== '[object Object]' &&
        consultationId !== 'undefined' &&
        consultationId !== 'null'
      ) {
        formData.append('consultationId', consultationId.trim())
      }

      const response = await apiClient.post<VoiceConsultationExtract>(
        '/consultations/voice-scribe/fr',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds dedicated timeout for cloud LLM clinical inference
        }
      )
      return response.data
    },
    onSuccess: (data) => {
      setState('COMPLETED')
      setExtractedData(data)
      toast.success('Dictée médicale structurée avec succès !', {
        description: `${data.medications.length} médicament(s) identifié(s) · Constantes extraites`,
      })
      options?.onSuccess?.(data)
    },
    onError: (err) => {
      setState('ERROR')
      setError(err)
      toast.error('Erreur lors du traitement de la dictée vocale', {
        description: err.message || 'Veuillez vérifier votre micro et réessayer.',
      })
      options?.onError?.(err)
    },
  })

  // Audio level analyzer loop
  const startAudioAnalyzer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioCtx = new AudioCtx()
      audioContextRef.current = audioCtx

      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      analyserRef.current = analyser

      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateLevel = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const avg = sum / bufferLength
        // Normalize 0..1
        setAudioLevel(Math.min(1, avg / 128))
        animFrameRef.current = requestAnimationFrame(updateLevel)
      }

      updateLevel()
    } catch (e) {
      console.warn('AudioContext not available for waveform visualizer', e)
    }
  }

  // Cleanup helper
  const cleanupMediaResources = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.abort()
      } catch (_) {}
      speechRecognitionRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setAudioLevel(0)
  }, [])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      cleanupMediaResources()
      audioChunksRef.current = []
      speechTranscriptRef.current = ''
      setLiveTranscript('')
      setRecordingSeconds(0)
      setError(null)

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'accès au microphone n'est pas supporté par ce navigateur.")
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      // Audio level analyser
      startAudioAnalyzer(stream)

      // Start Web Speech API Recognition in French (real-time voice to text)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition()
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = 'fr-FR'
          recognition.maxAlternatives = 1

          recognition.onresult = (event: any) => {
            let current = ''
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript + ' '
            }
            const clean = current.trim()
            speechTranscriptRef.current = clean
            setLiveTranscript(clean)
          }

          recognition.onerror = (e: any) => {
            if (e.error !== 'no-speech' && e.error !== 'aborted') {
              console.warn('SpeechRecognition notice:', e.error)
            }
          }

          recognition.start()
          speechRecognitionRef.current = recognition
        } catch (e) {
          console.warn('Web Speech Recognition could not start:', e)
        }
      }

      // MediaRecorder with best supported mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
      ]
      let selectedMimeType = ''
      for (const mt of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mt)) {
          selectedMimeType = mt
          break
        }
      }

      const recorder = selectedMimeType
        ? new MediaRecorder(stream, { mimeType: selectedMimeType })
        : new MediaRecorder(stream)

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current = recorder
      recorder.start(250) // collect slices every 250ms
      setState('RECORDING')

      // Timer counter
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      cleanupMediaResources()
      setState('ERROR')
      const message = err instanceof Error ? err.message : 'Accès au microphone refusé'
      setError(new Error(message))
      toast.error('Impossible de démarrer la dictée vocale', {
        description: message,
      })
    }
  }, [cleanupMediaResources])

  // Stop recording and send audio to backend
  const stopAndTranscribe = useCallback((consultationIdArg?: string | unknown) => {
    const safeConsultationId =
      typeof consultationIdArg === 'string' &&
      consultationIdArg !== '[object Object]' &&
      consultationIdArg.trim() !== ''
        ? consultationIdArg.trim()
        : undefined

    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') return

    setState('PROCESSING')

    // Stop speech recognition and get latest transcript
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop()
      } catch (_) {}
    }
    const capturedTranscript = speechTranscriptRef.current.trim()

    recorder.onstop = () => {
      const mime = recorder.mimeType || 'audio/webm'
      const audioBlob = new Blob(audioChunksRef.current, { type: mime })
      cleanupMediaResources()

      if (audioBlob.size === 0 && !capturedTranscript) {
        setState('ERROR')
        toast.error('Aucun son enregistré', {
          description: 'Veuillez parler distinctement dans le micro.',
        })
        return
      }

      scribeMutation.mutate({
        audioBlob,
        transcript: capturedTranscript,
        consultationId: safeConsultationId,
      })
    }

    recorder.stop()
  }, [cleanupMediaResources, scribeMutation])

  // Cancel recording without sending
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null
      mediaRecorderRef.current.stop()
    }
    cleanupMediaResources()
    audioChunksRef.current = []
    setState('IDLE')
    setRecordingSeconds(0)
  }, [cleanupMediaResources])

  // Reset to initial
  const reset = useCallback(() => {
    cancelRecording()
    setExtractedData(null)
    setError(null)
    setState('IDLE')
  }, [cancelRecording])

  // Clean on unmount
  useEffect(() => {
    return () => {
      cleanupMediaResources()
    }
  }, [cleanupMediaResources])

  return {
    state,
    isRecording: state === 'RECORDING',
    isProcessing: state === 'PROCESSING',
    recordingSeconds,
    audioLevel,
    extractedData,
    liveTranscript,
    error,
    startRecording,
    stopAndTranscribe,
    cancelRecording,
    reset,
  }
}
