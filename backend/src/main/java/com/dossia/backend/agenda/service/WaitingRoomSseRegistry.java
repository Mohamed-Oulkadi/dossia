package com.dossia.backend.agenda.service;

import com.dossia.backend.agenda.event.PatientCalledEvent;
import com.dossia.backend.agenda.event.WaitingRoomUpdatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Thread-Safe SSE Registry for Waiting Room live streaming.
 * Partitioned strictly by clinicId to guarantee Moroccan CNDP (Loi 09-08) multi-tenant isolation.
 */
@Service
@Slf4j
public class WaitingRoomSseRegistry {

    private static final long SSE_TIMEOUT_MS = 3600000L; // 1 Hour

    private final Map<UUID, List<SseEmitter>> clinicEmitters = new ConcurrentHashMap<>();

    /**
     * Registers a new SseEmitter for the authenticated clinic tenant.
     */
    public SseEmitter register(UUID clinicId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

        clinicEmitters.computeIfAbsent(clinicId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        log.info("Registered new SSE emitter for clinic {}. Active connections for clinic: {}",
                clinicId, getActiveConnectionsCount(clinicId));

        emitter.onCompletion(() -> {
            log.debug("SSE emitter completed for clinic {}", clinicId);
            removeEmitter(clinicId, emitter);
        });

        emitter.onTimeout(() -> {
            log.debug("SSE emitter timed out for clinic {}", clinicId);
            emitter.complete();
            removeEmitter(clinicId, emitter);
        });

        emitter.onError(ex -> {
            log.debug("SSE emitter error for clinic {}: {}", clinicId, ex.getMessage());
            removeEmitter(clinicId, emitter);
        });

        // Send immediate connection acknowledgment event
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data(Map.of(
                            "status", "CONNECTED",
                            "clinicId", clinicId.toString(),
                            "timestamp", System.currentTimeMillis()
                    )));
        } catch (IOException e) {
            log.warn("Failed to send initial SSE connected event for clinic {}: {}", clinicId, e.getMessage());
            removeEmitter(clinicId, emitter);
        }

        return emitter;
    }

    /**
     * Heartbeat scheduler: sends a keepalive comment every 25 seconds
     * to prevent Nginx reverse proxy or client timeouts.
     */
    @Scheduled(fixedRate = 25000)
    public void sendHeartbeats() {
        if (clinicEmitters.isEmpty()) {
            return;
        }

        clinicEmitters.forEach((clinicId, emitters) -> {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().comment("keepalive"));
                } catch (IOException e) {
                    log.debug("Keepalive ping failed for clinic {}. Removing dead emitter.", clinicId);
                    removeEmitter(clinicId, emitter);
                }
            }
        });
    }

    /**
     * Spring Modulith listener for waiting room updates (status changes, arrivals).
     */
    @ApplicationModuleListener
    public void onWaitingRoomUpdated(WaitingRoomUpdatedEvent event) {
        log.info("Broadcasting WAITING_ROOM_UPDATED event for clinic {} (appt: {}, status: {})",
                event.clinicId(), event.appointmentId(), event.status());
        broadcastToClinic(event.clinicId(), "WAITING_ROOM_UPDATED", event);
    }

    /**
     * Spring Modulith listener for doctor calling next patient.
     */
    @ApplicationModuleListener
    public void onPatientCalled(PatientCalledEvent event) {
        log.info("Broadcasting PATIENT_CALLED event for clinic {} (patient: {}, doctor: {})",
                event.clinicId(), event.patientFullName(), event.doctorName());
        broadcastToClinic(event.clinicId(), "PATIENT_CALLED", event);
    }

    private void broadcastToClinic(UUID clinicId, String eventName, Object data) {
        List<SseEmitter> emitters = clinicEmitters.get(clinicId);
        if (emitters == null || emitters.isEmpty()) {
            log.debug("No active SSE listeners for clinic {}", clinicId);
            return;
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (IOException e) {
                log.warn("Failed to broadcast {} to clinic {}. Removing dead emitter.", eventName, clinicId);
                removeEmitter(clinicId, emitter);
            }
        }
    }

    private void removeEmitter(UUID clinicId, SseEmitter emitter) {
        List<SseEmitter> list = clinicEmitters.get(clinicId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                clinicEmitters.remove(clinicId);
            }
        }
    }

    public int getActiveConnectionsCount(UUID clinicId) {
        List<SseEmitter> list = clinicEmitters.get(clinicId);
        return list != null ? list.size() : 0;
    }
}
