import { useEffect, useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useAuthStore } from '@/store/useAuthStore'
import { playPatientCalledChime } from '@/lib/audio-chime'
import { toast } from 'sonner'

export interface PatientCalledPayload {
  clinicId: string
  appointmentId: string
  patientFullName: string
  doctorName: string
  roomLabel: string
  timestamp: string
}

export interface WaitingRoomUpdatedPayload {
  clinicId: string
  appointmentId: string
  status: string
  timestamp: string
}

/**
 * Real-Time Waiting Room SSE Stream Hook.
 * Mounts in ClinicLayout to synchronize Secretary reception and Doctor consulting rooms.
 * Uses @microsoft/fetch-event-source to carry JWT headers and gracefully recover from network drops.
 */
export function useWaitingRoomStream() {
  const queryClient = useQueryClient()
  const { token, role, isAuthenticated } = useAuthStore()
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [lastEventTime, setLastEventTime] = useState<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Only connect if user is authenticated in an active clinic session
    if (!isAuthenticated || !token || role === 'SUPER_ADMIN') {
      setIsConnected(false)
      return
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    const connectStream = async () => {
      try {
        await fetchEventSource('/api/v1/agenda/stream', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
          },
          signal: controller.signal,

          onopen: async (response) => {
            if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
              setIsConnected(true)
              return
            }
            if (response.status === 401) {
              // Token expired, let Axios interceptor / auth store handle refresh
              controller.abort()
              setIsConnected(false)
              throw new Error('Unauthorized SSE connection')
            }
            throw new Error(`SSE connection failed with status: ${response.status}`)
          },

          onmessage: (msg) => {
            setLastEventTime(Date.now())

            // ── Event: Initial Connected Ack ──
            if (msg.event === 'CONNECTED') {
              setIsConnected(true)
              return
            }

            // ── Event: Waiting Room Status Transition (Patient Arrived / Check-in) ──
            if (msg.event === 'WAITING_ROOM_UPDATED') {
              queryClient.invalidateQueries({ queryKey: ['agenda'] })
              queryClient.invalidateQueries({ queryKey: ['waiting-room'] })
              return
            }

            // ── Event: Doctor Pager (Patient Called into Consultation) ──
            if (msg.event === 'PATIENT_CALLED') {
              queryClient.invalidateQueries({ queryKey: ['agenda'] })
              queryClient.invalidateQueries({ queryKey: ['waiting-room'] })

              try {
                const payload: PatientCalledPayload = JSON.parse(msg.data)

                // Secretary Alert: Audio chime + persistent priority toast
                if (role === 'SECRETARY') {
                  playPatientCalledChime()
                  toast.info(`🔔 Dr. ${payload.doctorName} appelle : ${payload.patientFullName}`, {
                    description: `Dirigez le patient vers : ${payload.roomLabel || 'Cabinet Médical'}`,
                    duration: 15000,
                    action: {
                      label: 'Patient orienté',
                      onClick: () => {
                        toast.success('Patient orienté vers le cabinet.')
                      },
                    },
                  })
                }
              } catch (e) {
                console.error('Failed to parse PATIENT_CALLED event payload:', e)
              }
            }
          },

          onclose: () => {
            setIsConnected(false)
          },

          onerror: (err) => {
            setIsConnected(false)
            if (controller.signal.aborted) {
              return
            }
            console.debug('Waiting room SSE stream interrupted. Auto-reconnecting...', err)
          },
        })
      } catch (err) {
        if (!controller.signal.aborted) {
          console.debug('SSE connection closed:', err)
          setIsConnected(false)
        }
      }
    }

    connectStream()

    return () => {
      controller.abort()
      setIsConnected(false)
    }
  }, [token, role, isAuthenticated, queryClient])

  return {
    isConnected,
    lastEventTime,
  }
}
