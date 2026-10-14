package com.dossia.backend.vault.dto;

import com.dossia.backend.vault.domain.DocumentCategory;
import com.dossia.backend.vault.domain.PatientDocument;
import com.dossia.backend.vault.domain.VisibilityLevel;

import java.time.Instant;
import java.util.UUID;

/**
 * Immutable DTO for patient document metadata.
 */
public record PatientDocumentResponse(
        UUID id,
        UUID clinicId,
        UUID patientId,
        UUID consultationId,
        String originalFilename,
        String contentType,
        long fileSizeBytes,
        String objectKey,
        DocumentCategory category,
        VisibilityLevel visibilityLevel,
        String description,
        Instant createdAt,
        String createdBy
) {
    public static PatientDocumentResponse from(PatientDocument doc) {
        return new PatientDocumentResponse(
                doc.getId(),
                doc.getClinicId(),
                doc.getPatientId(),
                doc.getConsultationId(),
                doc.getOriginalFilename(),
                doc.getContentType(),
                doc.getFileSizeBytes(),
                doc.getObjectKey(),
                doc.getCategory(),
                doc.getVisibilityLevel(),
                doc.getDescription(),
                doc.getCreatedAt(),
                doc.getCreatedBy()
        );
    }
}
