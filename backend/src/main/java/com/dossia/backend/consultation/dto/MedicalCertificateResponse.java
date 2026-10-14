package com.dossia.backend.consultation.dto;

import com.dossia.backend.consultation.domain.MedicalCertificateType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record MedicalCertificateResponse(
        UUID id,
        UUID clinicId,
        UUID consultationId,
        UUID patientId,
        String patientName,
        MedicalCertificateType certificateType,
        Integer restDays,
        String restDaysInWords,
        LocalDate startDate,
        LocalDate endDate,
        boolean isProlongation,
        String customNotes,
        Instant createdAt
) {}
