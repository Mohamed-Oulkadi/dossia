package com.dossia.backend.consultation.domain;

import com.dossia.backend.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Entity
@Table(name = "diagnostic_requests")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosticRequest extends AuditableEntity {

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
    @Column(name = "request_type", length = 50, nullable = false)
    private DiagnosticRequestType requestType;

    @Column(name = "items", columnDefinition = "TEXT", nullable = false)
    private String itemsJson;

    @Column(name = "clinical_indication", columnDefinition = "TEXT")
    private String clinicalIndication;
}
