package com.dossia.backend.consultation.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record MedicationCatalogDto(
        UUID id,
        String brandName,
        String dci,
        String dosage,
        String form,
        String defaultPosology,
        BigDecimal ppvMad
) {}
