package com.dossia.backend.consultation.dto;

import java.util.List;

public record PrescriptionCreateRequest(
        String notes,
        List<PrescriptionItemDto> items
) {
    public PrescriptionCreateRequest {
        if (items == null) {
            items = List.of();
        }
    }
}
