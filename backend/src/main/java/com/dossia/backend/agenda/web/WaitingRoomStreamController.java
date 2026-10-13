package com.dossia.backend.agenda.web;

import com.dossia.backend.agenda.dto.AppointmentResponse;
import com.dossia.backend.agenda.dto.CallPatientRequest;
import com.dossia.backend.agenda.service.AgendaService;
import com.dossia.backend.agenda.service.AgendaServiceImpl;
import com.dossia.backend.agenda.service.WaitingRoomSseRegistry;
import com.dossia.backend.auth.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

/**
 * Real-Time Waiting Room SSE Stream and Doctor Pager Controller.
 * Provides CNDP multi-tenant isolated event streaming for reception and consultation rooms.
 */
@RestController
@RequestMapping("/api/v1/agenda")
@RequiredArgsConstructor
@Slf4j
public class WaitingRoomStreamController {

    private final WaitingRoomSseRegistry sseRegistry;
    private final AgendaService agendaService;

    /**
     * Subscribes the client (Doctor or Secretary) to live waiting room updates.
     * Enforces strict clinic tenant isolation: only events matching the caller's clinicId are pushed.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeToWaitingRoomStream() {
        UUID clinicId = SecurityUtils.getCurrentClinicId();
        if (clinicId == null) {
            clinicId = AgendaServiceImpl.DEFAULT_CLINIC_ID;
        }

        log.info("Client subscribing to waiting room SSE stream for clinicId: {}", clinicId);
        return sseRegistry.register(clinicId);
    }

    /**
     * Doctor Pager CTA: The physician calls the next waiting patient into consultation.
     * Restricted strictly to ROLE_DOCTOR. Triggers SSE PatientCalledEvent to Secretary desk.
     */
    @PostMapping("/{id}/call")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AppointmentResponse> callPatient(
            @PathVariable UUID id,
            @RequestBody(required = false) CallPatientRequest request
    ) {
        String roomLabel = (request != null) ? request.roomLabel() : null;
        log.info("Doctor initiated call for appointment {} (room: {})", id, roomLabel);
        AppointmentResponse updated = agendaService.callPatient(id, roomLabel);
        return ResponseEntity.ok(updated);
    }
}
