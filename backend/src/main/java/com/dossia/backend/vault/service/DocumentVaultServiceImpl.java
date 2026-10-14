package com.dossia.backend.vault.service;

import com.dossia.backend.auth.SecurityUtils;
import com.dossia.backend.common.exception.ResourceNotFoundException;
import com.dossia.backend.patient.PatientService;
import com.dossia.backend.vault.domain.DocumentCategory;
import com.dossia.backend.vault.domain.PatientDocument;
import com.dossia.backend.vault.domain.VisibilityLevel;
import com.dossia.backend.vault.dto.DocumentStream;
import com.dossia.backend.vault.dto.PatientDocumentResponse;
import com.dossia.backend.vault.repository.PatientDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentVaultServiceImpl implements DocumentVaultService {

    public static final UUID DEFAULT_CLINIC_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    public static final long MAX_FILE_SIZE_BYTES = 10L * 1024L * 1024L; // 10MB

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final PatientService patientService;
    private final PatientDocumentRepository documentRepository;
    private final MinioStorageService minioStorageService;

    private UUID resolveClinicId() {
        UUID current = SecurityUtils.getCurrentClinicId();
        return current != null ? current : DEFAULT_CLINIC_ID;
    }

    @Override
    @Transactional
    public PatientDocumentResponse uploadDocument(
            UUID patientId,
            UUID consultationId,
            DocumentCategory category,
            String description,
            MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier transmis est vide.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("La taille du fichier dépasse la limite autorisée de 10 Mo.");
        }

        String rawContentType = file.getContentType();
        String contentType = rawContentType != null ? rawContentType.toLowerCase().trim() : "";
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Format de document non autorisé ('" + rawContentType + "'). Formats acceptés : PDF, JPEG, PNG, WEBP."
            );
        }

        UUID clinicId = resolveClinicId();

        // Spring Modulith boundary check: verifies patient belongs to caller's clinic
        patientService.getPatientById(patientId);

        // Automatic CNDP Loi 09-08 visibility level assignment
        VisibilityLevel visibilityLevel = switch (category) {
            case BIOLOGIE, RADIOLOGIE_IMAGERIE, COMPTE_RENDU -> VisibilityLevel.DOCTOR_ONLY;
            case ADMINISTRATIF_CNSS -> VisibilityLevel.SHARED_SECRETARY;
        };

        String fileUuid = UUID.randomUUID().toString();
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String ext = getFileExtension(originalFilename);

        // Namespaced multi-tenant object key: clinics/{clinic_id}/patients/{patient_id}/{document_uuid}.{ext}
        String objectKey = String.format("clinics/%s/patients/%s/%s%s", clinicId, patientId, fileUuid, ext);

        try (InputStream is = file.getInputStream()) {
            minioStorageService.uploadObject(objectKey, is, file.getSize(), contentType);
        } catch (IOException e) {
            throw new RuntimeException("Erreur de lecture du fichier uploadé : " + e.getMessage(), e);
        }

        PatientDocument document = PatientDocument.builder()
                .clinicId(clinicId)
                .patientId(patientId)
                .consultationId(consultationId)
                .originalFilename(originalFilename)
                .contentType(contentType)
                .fileSizeBytes(file.getSize())
                .objectKey(objectKey)
                .category(category)
                .visibilityLevel(visibilityLevel)
                .description(description != null ? description.trim() : null)
                .build();

        PatientDocument saved = documentRepository.save(document);
        log.info("Document '{}' (id: {}) successfully registered in vault for patient {}", originalFilename, saved.getId(), patientId);

        return PatientDocumentResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientDocumentResponse> getPatientDocuments(UUID patientId) {
        UUID clinicId = resolveClinicId();

        // Boundary check: patient must belong to current clinic
        patientService.getPatientById(patientId);

        // Role-based filtering per CNDP Loi 09-08
        if (SecurityUtils.isSecretary()) {
            return documentRepository
                    .findByClinicIdAndPatientIdAndVisibilityLevelAndDeletedAtIsNullOrderByCreatedAtDesc(
                            clinicId, patientId, VisibilityLevel.SHARED_SECRETARY
                    )
                    .stream()
                    .map(PatientDocumentResponse::from)
                    .toList();
        }

        return documentRepository
                .findByClinicIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(clinicId, patientId)
                .stream()
                .map(PatientDocumentResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentStream getDocumentStream(UUID documentId) {
        UUID clinicId = resolveClinicId();

        PatientDocument doc = documentRepository.findByClinicIdAndIdAndDeletedAtIsNull(clinicId, documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document médical introuvable dans votre cabinet."));

        // CNDP Doctor vs. Secretary privacy enforcement
        if (doc.getVisibilityLevel() == VisibilityLevel.DOCTOR_ONLY && SecurityUtils.isSecretary()) {
            log.warn("CNDP Security Alert: Secretary attempted to access DOCTOR_ONLY document {}", documentId);
            throw new AccessDeniedException(
                    "Accès refusé : Ce document médical relève du secret médical clinique et est strictement réservé au médecin (CNDP Loi 09-08)."
            );
        }

        InputStream stream = minioStorageService.getObjectStream(doc.getObjectKey());
        return new DocumentStream(stream, doc.getOriginalFilename(), doc.getContentType(), doc.getFileSizeBytes());
    }

    @Override
    @Transactional
    public void deleteDocument(UUID documentId) {
        UUID clinicId = resolveClinicId();

        PatientDocument doc = documentRepository.findByClinicIdAndIdAndDeletedAtIsNull(clinicId, documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document médical introuvable dans votre cabinet."));

        // Soft-delete per CNDP audit trail preservation
        doc.setDeletedAt(Instant.now());
        documentRepository.save(doc);
        log.info("Document {} soft-deleted by user per CNDP retention requirements.", documentId);
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}
