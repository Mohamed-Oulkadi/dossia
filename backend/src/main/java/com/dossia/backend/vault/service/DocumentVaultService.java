package com.dossia.backend.vault.service;

import com.dossia.backend.vault.domain.DocumentCategory;
import com.dossia.backend.vault.dto.DocumentStream;
import com.dossia.backend.vault.dto.PatientDocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Public service contract for the Coffre-Fort Documents & Imagerie module.
 */
public interface DocumentVaultService {

    PatientDocumentResponse uploadDocument(
            UUID patientId,
            UUID consultationId,
            DocumentCategory category,
            String description,
            MultipartFile file
    );

    List<PatientDocumentResponse> getPatientDocuments(UUID patientId);

    DocumentStream getDocumentStream(UUID documentId);

    void deleteDocument(UUID documentId);
}
