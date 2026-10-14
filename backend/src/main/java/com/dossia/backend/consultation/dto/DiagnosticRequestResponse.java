package com.dossia.backend.consultation.dto;

import com.dossia.backend.consultation.domain.DiagnosticRequestType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DiagnosticRequestResponse(
        UUID id,
        UUID clinicId,
        UUID consultationId,
        UUID patientId,
        String patientName,
        DiagnosticRequestType requestType,
        List<String> items,
        String clinicalIndication,
        Instant createdAt
) {}
