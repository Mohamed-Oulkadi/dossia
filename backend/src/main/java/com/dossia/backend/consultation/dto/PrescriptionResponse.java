package com.dossia.backend.consultation.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PrescriptionResponse(
        UUID id,
        UUID consultationId,
        String notes,
        List<PrescriptionItemDto> items,
        Instant createdAt
) {}
