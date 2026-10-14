package com.dossia.backend.vault.domain;

import com.dossia.backend.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "patient_documents")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDocument extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "clinic_id", nullable = false)
    private UUID clinicId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "consultation_id")
    private UUID consultationId;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "file_size_bytes", nullable = false)
    private long fileSizeBytes;

    @Column(name = "object_key", nullable = false, unique = true)
    private String objectKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private DocumentCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility_level", nullable = false)
    private VisibilityLevel visibilityLevel;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
