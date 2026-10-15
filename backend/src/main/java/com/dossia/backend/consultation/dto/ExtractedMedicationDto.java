package com.dossia.backend.consultation.dto;

import java.util.UUID;

public record ExtractedMedicationDto(
        UUID matchedCatalogId,
        String medicationName,
        String dosage,
        String duration,
        String instructions,
        boolean matchedInMoroccanCatalog
) {}
