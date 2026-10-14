package com.dossia.backend.consultation.dto;

import java.util.List;
import java.util.UUID;

public record PrescriptionTemplateDto(
        UUID id,
        UUID clinicId,
        boolean isSystemDefault,
        String title,
        String category,
        List<PrescriptionItemDto> items
) {}
