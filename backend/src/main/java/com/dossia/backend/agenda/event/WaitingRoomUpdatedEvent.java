package com.dossia.backend.agenda.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain Event published whenever an appointment transitions status or waiting room order changes.
 * Partitioned strictly by clinicId to enforce CNDP (Loi 09-08) multi-tenant isolation.
 */
public record WaitingRoomUpdatedEvent(
        UUID clinicId,
        UUID appointmentId,
        String status,
        Instant timestamp
) {
    public WaitingRoomUpdatedEvent(UUID clinicId, UUID appointmentId, String status) {
        this(clinicId, appointmentId, status, Instant.now());
    }
}
