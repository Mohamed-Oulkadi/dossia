package com.dossia.backend.agenda.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain Event published when a Doctor signals the next patient from the waiting room.
 * Prompts the Secretary desk with an audio chime and priority toast notification.
 */
public record PatientCalledEvent(
        UUID clinicId,
        UUID appointmentId,
        String patientFullName,
        String doctorName,
        String roomLabel,
        Instant timestamp
) {
    public PatientCalledEvent(UUID clinicId, UUID appointmentId, String patientFullName, String doctorName, String roomLabel) {
        this(clinicId, appointmentId, patientFullName, doctorName, roomLabel, Instant.now());
    }
}
