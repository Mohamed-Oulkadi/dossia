package com.dossia.backend.consultation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ConsultationResponse(
        UUID id,
        UUID patientId,
        String patientName,
        Integer patientAge,
        UUID appointmentId,
        String motif,
        String clinicalNotes,
        String diagnosis,
        String bloodPressure,
        BigDecimal weightKg,
        Integer heartRateBpm,
        PrescriptionResponse prescription,
        Instant createdAt
) {}
