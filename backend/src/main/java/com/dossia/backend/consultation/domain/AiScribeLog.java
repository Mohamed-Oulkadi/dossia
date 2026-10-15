package com.dossia.backend.consultation.domain;

import com.dossia.backend.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "ai_scribe_logs")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiScribeLog extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "clinic_id", nullable = false)
    private UUID clinicId;

    @Column(name = "consultation_id")
    private UUID consultationId;

    @Column(name = "language_code", nullable = false, length = 10)
    @Builder.Default
    private String languageCode = "fr-FR";

    @Column(name = "audio_duration_seconds")
    private Integer audioDurationSeconds;

    @Column(name = "raw_transcript", columnDefinition = "TEXT")
    private String rawTranscript;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extracted_json", columnDefinition = "jsonb")
    private String extractedJson;

    @Column(name = "processing_time_ms", nullable = false)
    private Long processingTimeMs;
}
