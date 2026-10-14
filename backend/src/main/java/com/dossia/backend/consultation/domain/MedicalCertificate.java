package com.dossia.backend.consultation.domain;

import com.dossia.backend.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "medical_certificates")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalCertificate extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "clinic_id", nullable = false)
    private UUID clinicId;

    @Column(name = "consultation_id", nullable = false)
    private UUID consultationId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "certificate_type", length = 50, nullable = false)
    private MedicalCertificateType certificateType;

    @Column(name = "rest_days")
    private Integer restDays;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "is_prolongation", nullable = false)
    @Builder.Default
    private Boolean isProlongation = false;

    @Column(name = "custom_notes", columnDefinition = "TEXT")
    private String customNotes;
}
